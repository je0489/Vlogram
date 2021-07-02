import User from "../models/User";
import Video from "../models/Video";
import fetch from "node-fetch";
import bcrypt from "bcrypt";
import message from "../message"

export const getJoin = (req, res) => res.render("users/join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  const { id, password, confirmPassword, name, email, location } = req.body;
  const pageTitle = "Join";
  if (password !== confirmPassword) {
    req.flash(message.type.e, message.msg.notMatchPassword);
    return res.status(400).render("users/join", { pageTitle });
  };
  const exists = await User.exists({ $or: [{ id }, { email }] });
  if (exists) {
    req.flash(message.type.e, message.msg.isExistUser);
    return res.status(400).render("users/join", { pageTitle });
  }
  try {
    await User.create({
      id,
      password,
      name,
      email,
      location
    });
    req.flash(message.type.s, message.msg.joinSucess);
    return res.redirect("/login");
  } catch( e ) {
    req.flash(message.type.e, e._message);
    return res.status(400).render("users/join", { pageTitle });
  }
};
export const getLogin = ( req, res ) => res.render( "users/login", { pageTitle: "Login" } ); 
export const postLogin = async ( req, res ) => {
  const { id, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne( { id, socialOnly: false } );
  if( !user ) {
    req.flash(message.type.e, message.msg.loginFail[0].aboutId);
    return res.status( 400 ).render( "users/login", { pageTitle } );
  }
  const ok = await bcrypt.compare( password, user.password );
  if( !ok ) {
    req.flash(message.type.e, message.msg.loginFail[0].aboutPsw);
    return res.status( 400 ).render( "users/login", { pageTitle } );
  }
  req.session.loggedIn = true;
  req.session.user = user;
  req.flash(message.type.s, message.msg.loginSucess + user.name);
  res.redirect( "/" );
};
export const startGithubLogin = ( req, res ) => {
  const baseUrl = "https://github.com/login/oauth/authorize";
  const config = {
    client_id: process.env.GH_CLIENT,
    allow_signup: false,
    scope: "read:user user:email"
  }
  const params = new URLSearchParams( config );
  res.redirect( `${baseUrl}?${params}` );
};
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await ( 
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      }
    })
  ).json();
  if( "access_token" in tokenRequest ) {
    const { access_token } = tokenRequest;
    const apiUrl = "https://api.github.com";
    const userData = await (
      await fetch(`${apiUrl}/user`, {
        headers: {
          Authorization: `token ${access_token}`
        }
      })
    ).json();
    const emailData = await (
      await fetch( `${apiUrl}/user/emails`, {
        headers: {
          Authorization: `token ${access_token}`
        }
      })
    ).json();
    const emailObj = emailData.find( email => email.primary && email.verified );
    if( !emailObj ) {
      req.flash(message.type.e, message.msg.loginFail[1]);
      return res.redirect( "/login" );
    }
    let user = await User.findOne({ $or: [{ id:userData.login }, { email: emailObj.email }]});
    if( !user ) {
      console.log(userData);
      user = await User.create({
        id: userData.login,
        password: "",
        socialOnly: true,
        avatarUrl: userData.avatar_url,
        name: userData.name,
        email: emailObj.email,
        location: userData.location
      });
    }
      req.session.loggedIn = true;
      req.session.user = user;
      req.flash(message.type.s, message.msg.loginSucess + user.name);
      return res.redirect("/");
  } else {
    req.flash(message.type.e, message.msg.loginFail[1]);
    return res.redirect("/login");
  }
};
export const getEdit = ( req, res ) => res.render( "users/edit-profile", { pageTitle: "Edit Profile" } ); 
export const postEdit = async ( req, res ) => {
  const {
    session: {
      user: { _id, avatarUrl }
    },
    body: { id, name, email, location },
    file
  } = req;
  const updateUser = await User.findByIdAndUpdate(
    _id,
    {
      id,
      avatarUrl: file ? file.path : avatarUrl,
      name,
      email,
      location
    },
    { new: true }
  );
  req.session.user = updateUser;
  return res.redirect( "/users/edit" );
};
export const logout = ( req, res ) => {
  req.flash(message.type.i, message.msg.logout);
  req.session.destroy();
  return res.redirect("/");
}; 
export const getChangePassword = ( req, res ) => {
  if (req.session.user.socialOnly === true) {
    req.flash(message.type.e, message.msg.githubUser);
    return res.redirect("/");
  }
  return res.render( "users/change-password", { pageTitle: "Change Password" } );
};
export const postChangePassword = async ( req, res ) => {
  const pageTitle = "Change Password";
  const {
    session: {
      user: { _id }
    },
    body: { oldPassword, newPassword, newPasswordConfirmation }
  } = req;
  const user = await User.findById( _id );
  const ok = await bcrypt.compare( oldPassword, user.password );
  if ( !ok ) {
    req.flash(message.type.e, message.msg.notSameCurPassword);
    return res.status(400).render("users/change-password", { pageTitle });
  }
  if ( newPassword !== newPasswordConfirmation ) {
    req.flash(message.type.e, message.msg.notMatchPassword);
    return res.status(400).render("users/change-password", { pageTitle });
  }
  user.password = newPassword;
  await user.save();
  req.flash(message.type.i, message.msg.updatePasswordSucess);
  return res.redirect( "/users/logout" );
};
export const see = async ( req, res ) => {
  const { id } = req.params;
  const user = await User.findById( id ).populate( {
    path: "videos",
    populate: {
      path: "owner",
      model: "User"
    }
  });
  if( !user )
    return res.status( 400 ).render( "404" );
  console.log( user.videos );
  return res.render( "videos/profile", { pageTitle: user.name, user, videos: user.videos });
}; 