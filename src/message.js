const message = {
    type: {
        e: "error",
        i: "info",
        s: "success"
    },
    msg: {
        user: {
            notMatchPassword: "Password confirmation does not match.",
            isExistUser: "This Id or Email is already taken.",
            joinSuccess: "Join Success!",
            loginSuccess: "Welcome, ",
            loginFail: [{
                aboutId: "An account with this Id does not exists.",
                aboutPsw: "Wrong password"
            }, "Login Fail"],
            logout: "Bye Bye",
            githubUser: "[gitHub User] Can't change password.",
            notSameCurPassword: "The current password is incorrect",
            updatePasswordSuccess: "Password updated"
        },
        video: {
            uploadSuccess: "Upload Success!"
        }
    }
};

export default message;