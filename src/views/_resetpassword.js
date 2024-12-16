import React from 'react';

const ResetPasswordForm = ({ toggleForm }) => {

  const goToForgotPasswordStep2 = () => {
    document.getElementById('forgotPasswordStep1').style.display = 'none';
    document.getElementById('forgotPasswordStep2').style.display = 'block';
  };

  return (
    <div className="login-form" id="forgotPasswordForm">
      <h1>Đổi mật khẩu</h1>
      <form id="forgotPasswordStep1" method="post">
        <input type="text" placeholder="Tên đăng nhập" name="username" required style={{ height: '41.2px' }}/>
        {/* <input type="email" placeholder="Email" name="email" required style={{ height: '41.2px' }}/> */}
        <input type="button" value="Nhận mã xác nhận" onClick={goToForgotPasswordStep2} />
      </form>
      <form id="forgotPasswordStep2" method="post" style={{ display: 'none' }}>
        <input type="text" placeholder="Mã xác nhận" name="code" required maxLength="6" pattern="[0-9]{6}" title="Please enter a 6-digit code" style={{ height: '41.2px' }}/>
        <input type="password" placeholder="Mật khẩu mới " name="new-password" required style={{ height: '41.2px' }}/>
        <input type="password" placeholder="Xác nhận mật khẩu mới" name="confirm-password" required style={{ height: '41.2px' }}/>
        <input type="submit" value="Đổi mật khẩu" />
      </form>
      <div className="register-link" onClick={() => toggleForm('login')}>
        Về đăng nhập
      </div>
    </div>
  );
};

export default ResetPasswordForm;
