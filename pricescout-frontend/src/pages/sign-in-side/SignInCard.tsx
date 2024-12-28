import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MuiCard from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";

import { styled } from "@mui/material/styles";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { backendAxios } from "../../config/api.config";
import { FacebookIcon, GoogleIcon, HandChainrityIcon } from "./CustomIcons";
import ForgotPassword from "./ForgotPassword";

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  boxShadow:
    "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("sm")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow:
      "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export default function SignInCard() {
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate(); // 初始化 navigate
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // 先进行客户端验证
    if (!validateInputs()) {
      return; // 如果验证失败，直接返回
    }

    const data = new FormData(event.currentTarget);
    let username = data.get("email");
    let password = data.get("password");

    try {
      const response = await backendAxios.post("/user/sign_in/", {
        user_name: username,
        password: password,
      });

      if (response.data.state) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify(response.data.userInfo)
        );
        axios.defaults.headers.common["Authorization"] =
          response.data.userInfo.token;

        window.dispatchEvent(new Event("userInfoUpdate"));

        navigate("/", { state: { from: "login", success: true } });
      } else {
        // 处理后端返回的错误信息
        setPasswordError(true);
        setPasswordErrorMessage(response.data.error || "登录失败");
      }
    } catch (err: any) {
      setPasswordError(true);
      const errorMessage = err.response?.data?.error || "登录失败，请稍后重试";
      if (errorMessage.includes("用户不存在")) {
        setEmailError(true);
        setEmailErrorMessage(errorMessage);
      } else if (errorMessage.includes("密码错误")) {
        setPasswordError(true);
        setPasswordErrorMessage(errorMessage);
      } else {
        setPasswordError(true);
        setPasswordErrorMessage(errorMessage);
      }
      console.error("Login error:", err);
    }
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    // 重置所有错误状态
    setEmailError(false);
    setEmailErrorMessage("");
    setPasswordError(false);
    setPasswordErrorMessage("");

    // 用户名/邮箱验证
    if (!email.value || email.value.trim().length < 1) {
      setEmailError(true);
      setEmailErrorMessage("请输入用户名或邮箱");
      isValid = false;
    }

    // 密码验证（为管理员账号添加特殊处理）
    if (email.value === "admin" && password.value === "admin") {
      // 管理员账号使用特殊验证规则
      isValid = true;
    } else if (!password.value || password.value.length < 6) {
      // 其他普通账号使用常规验证规则
      setPasswordError(true);
      setPasswordErrorMessage("密码长度必须至少为6位");
      isValid = false;
    }

    return isValid;
  };

  return (
    <Card variant="outlined">
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          height: 21,
          width: 100,
          marginBottom: 2,
          marginLeft: -10,
          marginTop: -3,
        }}
      >
        <HandChainrityIcon />
      </Box>
      <Typography component="h1" variant="h4" sx={{ width: "100%" }}>
        Sign in to <b style={{ color: "#ff914d" }}>PriceScout</b>
        <br /> | 登录比价小子
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
      >
        <FormControl>
          <FormLabel htmlFor="email">用户名/邮箱</FormLabel>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            id="email"
            name="email"
            placeholder="用户名或邮箱"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? "error" : "primary"}
          />
        </FormControl>
        <FormControl>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <FormLabel htmlFor="password">密码</FormLabel>
            <Link
              component="button"
              onClick={handleClickOpen}
              variant="body2"
              sx={{ alignSelf: "baseline" }}
            >
              忘记密码？
            </Link>
          </Box>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? "error" : "primary"}
          />
        </FormControl>
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="记住密码"
        />
        <ForgotPassword open={open} handleClose={handleClose} />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          onClick={validateInputs}
        >
          Sign in | 登录
        </Button>
        <Typography sx={{ textAlign: "center" }}>
          还没有账户?{" "}
          <span>
            <Link href="signUp" variant="body2" sx={{ alignSelf: "center" }}>
              Sign up | 注册
            </Link>
          </span>
        </Typography>
      </Box>
      <Divider>或者选择以下登陆方式</Divider>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          onClick={() => alert("Sign in with Google")}
          startIcon={<GoogleIcon />}
        >
          使用 Google 登录
        </Button>
        <Button
          type="submit"
          fullWidth
          variant="outlined"
          onClick={() => alert("Sign in with Facebook")}
          startIcon={<FacebookIcon />}
        >
          使用 Facebook 登录
        </Button>
      </Box>
    </Card>
  );
}
