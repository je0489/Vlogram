const message = {
    type: {
        e: "error",
        i: "info",
        s: "success"
    },
    msg: {
        notMatchPassword: "Password confirmation does not match.",
        isExistUser: "This Id or Email is already taken.",
        joinSucess: "Join Sucess!",
        loginSucess: "Welcome, ",
        loginFail: [{
            aboutId: "An account with this Id does not exists.",
            aboutPsw: "Wrong password"
        }, "Login Fail"],
        logout: "Bye Bye",
        githubUser: "[gitHub User] Can't change password.",
        notSameCurPassword: "The current password is incorrect",
        updatePasswordSucess: "Password updated"
    }
};

export default message;