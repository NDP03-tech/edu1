import React from 'react';

const LoginMain = () => {
    return (
        <>
            <div className="react-login-page react-signup-page pt---120 pb---120">
                <div className="container">
                    <div className="row">                            
                        <div className="col-lg-12">
                            <div className="login-right-form">
                                <form>
                                    <div className="login-top">
                                        <h3>Login</h3>
                                        <p>Don't have an account yet? </p>
                                    </div>
                                    <p>
                                        <label>Email</label>
                                        <input placeholder="Email" type="email" id="email" name="email" />
                                    </p>
                                    <p>
                                        <label>Password</label>
                                        <input placeholder="Password" type="password" id="pass" name="pass" />
                                    </p>
                                    <div className="back-check-box">
                                        <input type="checkbox" id="box-1" /> Remember me
                                        <p>Forget password?</p>
                                    </div>
                                    <button 
    type="submit" 
    id="button" 
    name="submit" 
    style={{ 
        backgroundColor: '#002366', 
        color: 'white', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' /* Căn giữa theo chiều ngang */
    }}
>
    Login 
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right">
        <line x1="5" y1="12" x2="19" y2="12"></line>
        <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
</button>
                                                                       
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
        </>

    );
}


export default LoginMain;