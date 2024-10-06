<template>
  <section>
    <div class="form" v-if="newUserVisible">
      <p class="title">Register</p>
      <p class="message">Signup now and get full access to our app.</p>
      <div class="flex">
        <label>
          <input
            class="input"
            type="text"
            required="required"
            v-model="newusername"
          />
          <span>NickName</span>
        </label>
      </div>

      <label>
        <input
          class="input"
          type="email"
          required="required"
          v-model="newemail"
        />
        <span>Email</span>
      </label>

      <label>
        <input class="input" required="required" v-model="newphonenum" />
        <span>Phone Number</span>
      </label>

      <label>
        <input
          class="input"
          type="password"
          required="required"
          v-model="newpassword"
        />
        <span>Password</span>
      </label>

      <label>
        <input
          class="input"
          type="password"
          required="required"
          v-model="newpassword_agagin"
        />
        <span>Confirm password</span>
      </label>
      <button class="submit_button" @click="register">submit</button>
      <p class="signin">
        Already have an account?
        <a
          href="#"
          @click="
            () => {
              newUserVisible = false;
            }
          "
          >Signin</a
        >
      </p>
    </div>

    <div class="form-box" v-if="!newUserVisible">
      <div class="form-value">
        <div>
          <h2>登录</h2>
          <div class="inputbox">
            <div class="icon-email iconfont"></div>
            <input type="text" v-model="account" required="required" />
            <label>用户名/邮箱</label>
          </div>
          <div class="inputbox">
            <div class="icon-lock iconfont"></div>
            <input type="password" v-model="password" required="required" />
            <label>密码</label>
          </div>
          <div class="forget">
            <label><input type="checkbox" />记住密码</label>
            <a href="#">忘记密码</a>
          </div>
          <button @click="handle">登录</button>
          <div class="register">
            <p>
              没有账户请<a
                href="#"
                @click="
                  () => {
                    newUserVisible = true;
                  }
                "
                >注册</a
              >
            </p>
          </div>
          <h5><router-link to="/dashboard">Go to user</router-link></h5>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { ElMessage } from "element-plus";

export default {
  setup() {
    const account = ref("");
    const password = ref("");
    const newusername = ref("");
    const newemail = ref("");
    const newpassword = ref("");
    const newpassword_agagin = ref("");
    const newphonenum = ref("");
    const router = useRouter();
    const newUserVisible = ref(false);
    const usernameError = ref("");
    const emailError = ref("");
    const passwordError = ref("");

    const validateUsername = () => {
      usernameError.value =
        newusername.value.length < 6 ? "用户名必须在6字节以上" : "";
      if (usernameError.value) ElMessage.error("用户名必须在6字节以上");
    };

    const validateEmail = () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      emailError.value = !emailPattern.test(newemail.value)
        ? "请输入有效的邮箱地址"
        : "";
      if (emailError.value) ElMessage.error("请输入有效的邮箱地址");
    };

    const validatePassword = () => {
      passwordError.value =
        newpassword.value.length < 6 ? "密码必须在6字节以上" : "";
      if (passwordError.value) ElMessage.error("密码必须在6字节以上");
    };

    const register = async () => {
      // ElMessage.success("注册成功了吗");
      validateUsername();
      validateEmail();
      validatePassword();
      console.log(usernameError.value);
      console.log(emailError.value);
      console.log(passwordError.value);
      if (!usernameError.value && !emailError.value && !passwordError.value) {
        console.log(777);

        await axios
          .post("/user/sign_up/", {
            user_name: newusername.value,
            password: newpassword.value,
            email: newemail.value,
            phone_num: newphonenum.value,
          })
          .then((response) => {
            // console.log(response);
            ElMessage.success("注册成功");
            this.newUserVisible = false;
          })
          .catch((error) => {
            ElMessage.error(error.response.data.error);
          });
      } else {
        ElMessage.error("请按要求填写");
      }
    };

    const handle = async () => {
      await axios
        .post("/user/sign_in/", {
          user_name: account.value,
          password: password.value,
        })
        .then((response) => {
          account.value = "";
          password.value = "";
          window.location.href = "/dashboard?user_id=" + response.data.user_id;
        })
        .catch((error) => {
          ElMessage.error(error.response.data.error);
        });
    };

    return {
      account,
      password,
      newpassword_agagin,
      newusername,
      newphonenum,
      newemail,
      newpassword,
      usernameError,
      emailError,
      passwordError,
      newUserVisible,
      handle,
      register,
    };
  },
};
</script>

<style scoped>
@import "../iconfont/iconfont.css";

/* From Uiverse.io by ammarsaa */
.error {
  color: red;
  font-size: 12px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 350px;
  padding: 20px;
  border-radius: 20px;
  position: relative;
  background-color: #1a1a1a;
  color: #fff;
  border: 1px solid #333;
}

.title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -1px;
  position: relative;
  display: flex;
  align-items: center;
  padding-left: 30px;
  color: #00bfff;
}

.title::before {
  width: 18px;
  height: 18px;
}

.title::after {
  width: 18px;
  height: 18px;
  animation: pulse 1s linear infinite;
}

.title::before,
.title::after {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  border-radius: 50%;
  left: 0px;
  background-color: #00bfff;
}

.message,
.signin {
  font-size: 14.5px;
  color: rgba(255, 255, 255, 0.7);
}

.signin {
  text-align: center;
}

.signin a:hover {
  text-decoration: underline royalblue;
}

a {
  color: #00bfff;
}

.flex {
  display: flex;
  width: 100%;
  gap: 6px;
}

.form label {
  position: relative;
  width: 95%;
}

.form label .input {
  background-color: #333;
  color: #fff;
  width: 100%;
  padding: 20px 05px 05px 10px;
  outline: 0;
  border: 1px solid rgba(105, 105, 105, 0.397);
  border-radius: 10px;
}

.form label .input + span {
  color: rgba(255, 255, 255, 0.5);
  position: absolute;
  left: 10px;
  top: 0px;
  font-size: 0.9em;
  cursor: text;
  transition: 0.3s ease;
}

.form label .input:placeholder-shown + span {
  top: 12.5px;
  font-size: 0.9em;
}

.form label .input:focus + span,
.form label .input:valid + span {
  color: #00bfff;
  top: 0px;
  font-size: 0.7em;
  font-weight: 600;
}

.input {
  font-size: medium;
}

.submit_button {
  border: none;
  outline: none;
  padding: 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 16px;
  transform: 0.3s ease;
  background-color: #00bfff;
}

.submit_button:hover {
  background-color: #00bfff96;
}

@keyframes pulse {
  from {
    transform: scale(0.9);
    opacity: 1;
  }

  to {
    transform: scale(1.8);
    opacity: 0;
  }
}

.iconfont {
  font-family: "iconfont" !important;
  font-size: 24px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.icon-email:before {
  content: "\e66f";
}

.icon-lock:before {
  content: "\e69e";
}

* {
  margin: 0;
  padding: 0;
}

.inputbox div {
  display: inline;
}

section {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background: url("../img/background.jpg");
  background-position: center;
  background-size: cover;
}

.form-box {
  position: relative;
  width: 400px;
  height: 450px;
  background-color: transparent;
  border: 2px solid rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
}

h2 {
  font-size: 32px;
  color: #fff;
  text-align: center;
}

.inputbox {
  position: relative;
  margin: 30px 0;
  width: 310px;
  border-bottom: 2px solid #fff;
}

.inputbox label {
  position: absolute;
  top: 50%;
  left: 5px;
  transform: translateY(-50%);
  color: #fff;
  font-size: 16px;
  pointer-events: none;
  transition: 0.5s;
}

input:focus ~ label,
input:valid ~ label {
  top: -5px;
}

.inputbox input {
  width: 100%;
  height: 50px;
  background-color: transparent;
  border: none;
  outline: none;
  font-size: 16px;
  padding: 0 35px 0 5px;
  color: #fff;
}

.inputbox .iconfont {
  position: absolute;
  right: 8px;
  top: 20px;
  color: #fff;
}

.forget {
  margin: -15px 0 15px;
  font-size: 14px;
  color: #fff;
  display: flex;
  justify-content: center;
}

.forget label input {
  margin-right: 5px;
}

.forget a {
  text-decoration: none;
  color: #fff;
  margin-left: 10px;
}

button {
  width: 100%;
  height: 40px;
  border-radius: 20px;
  border: none;
  outline: none;
  font-size: 16px;
  font-weight: 600;
  background: #fff;
}

.register {
  font-size: 14px;
  color: #fff;
  text-align: center;
  margin: 25px 0 10px;
}
</style>
