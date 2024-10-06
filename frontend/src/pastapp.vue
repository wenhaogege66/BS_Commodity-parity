<template>
  <section :style="{ backgroundImage: 'url(' + currentBackground + ')' }">
    <div class="form-box">
      <div class="form-value">
        <div>
          <h2>登录</h2>
          <div class="inputbox">
            <div class="icon-email iconfont"></div>
            <input type="text" v-model="myname" required />
            <label>用户名/邮箱</label>
          </div>
          <div class="inputbox">
            <div class="icon-lock iconfont"></div>
            <input type="password" v-model="mypassword" required />
            <label>密码</label>
          </div>
          <div class="forget">
            <label><input type="checkbox" />记住密码</label>
            <a href="#">忘记密码</a>
          </div>
          <button @click="switchUI">登录</button>
          <div class="register">
            <p>没有账户请<a href="#">注册</a></p>
          </div>
          <!-- 新增的切换背景按钮 -->
          <button @click="switchBackground">切换背景图片</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const myname = ref("");
    const mypassword = ref("");
    const router = useRouter();

    // 定义背景图片数组
    const backgroundImages = [
      "./img/background.jpg",
      "./img/background1.jpg",
      "./img/background2.jpg",
      "./img/background3.jpg",
      // 可以继续添加更多背景图片路径
    ];

    const currentBackground = ref(backgroundImages[0]); // 初始化背景图片
    let backgroundIndex = 0; // 当前背景图片的索引

    // 切换背景图片的函数
    const switchBackground = () => {
      backgroundIndex = (backgroundIndex + 1) % backgroundImages.length;
      currentBackground.value = backgroundImages[backgroundIndex];
    };

    const switchUI = () => {
      if (myname.value !== "" && mypassword.value !== "") {
        console.log("调试用户名");
        console.log(myname.value);
        localStorage.setItem("myname", myname.value);
        localStorage.setItem("mypassword", mypassword.value);
        router.push("/chat");
      }
    };

    return {
      myname,
      mypassword,
      switchUI,
      switchBackground,
      currentBackground,
    };
  },
};
</script>

<style scoped>
@import "./iconfont/iconfont.css";

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
