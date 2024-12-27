import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import MenuIcon from "@mui/icons-material/Menu";
import { Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import { alpha, styled } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import HandChainrityIcon from "./HandChainrityIcon";
// import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Menu } from "@mui/material";
import userImage from "../img/user.png";
import { useEffect } from "react";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  marginTop: "-5%",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate(); // 初始化导航钩子
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [userInfo, setUserInfo] = React.useState(
    JSON.parse(localStorage.getItem("userInfo") || "{}")
  );
  const isLoggedIn = Boolean(userInfo.user_name); // 检查是否登录

  // 监听 localStorage 变化
  useEffect(() => {
    const handleStorageChange = () => {
      const newUserInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      setUserInfo(newUserInfo);
    };

    // 添加自定义事件监听器
    window.addEventListener("userInfoUpdate", handleStorageChange);

    return () => {
      window.removeEventListener("userInfoUpdate", handleStorageChange);
    };
  }, []);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleSignInClick = () => {
    navigate("/signin"); // 跳转到 signinsignup 页面
  };

  const handleSignUpClick = () => {
    navigate("/signup"); // 可根据需求跳转到不同的路径
  };

  // 打开菜单
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // 关闭菜单
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGoUser = () => {
    navigate("/root/user"); // 跳转到个人主页
    handleMenuClose();
  };

  // 退出登录逻辑
  const handleLogout = () => {
    localStorage.removeItem("userInfo"); // 清除用户信息
    setUserInfo({});
    handleMenuClose();
    navigate("/");
  };

  // 添加Icon点击事件处理函数
  const handleIconClick = () => {
    navigate("/");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: 10,
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box sx={{ display: "flex", alignItems: "center", px: 0 }}>
            <Box sx={{ cursor: "pointer" }} onClick={handleIconClick}>
              <HandChainrityIcon />
            </Box>
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                variant="text"
                onClick={() => {
                  navigate("/root/campaign");
                }}
              >
                商品列表
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  navigate("/root/launch");
                }}
              >
                上架商品
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  navigate("/root/about");
                }}
              >
                关于我们
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {isLoggedIn ? (
              <>
                <img
                  src={userImage}
                  alt="用户头像"
                  style={{ width: "30px", height: "auto" }}
                />
                <Button onClick={handleMenuOpen} size="small">
                  <Typography variant="body1">
                    {userInfo.user_name || "未填写姓名"}
                  </Typography>
                </Button>

                {/* 菜单组件 */}

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  sx={{
                    "& .MuiPaper-root": {
                      width: "300px", // 让菜单适配文本长度
                    },
                  }}
                >
                  <MenuItem onClick={handleGoUser}>个人主页</MenuItem>
                  <MenuItem onClick={handleLogout}>退出登录</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  color="primary"
                  variant="text"
                  onClick={handleSignInClick}
                >
                  登录
                </Button>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={handleSignUpClick}
                >
                  注册
                </Button>
              </>
            )}
          </Box>

          <Box
            sx={{
              display: { sm: "flex", md: "none" },
              alignItems: "center",
              ml: "auto",
            }}
          >
            {isLoggedIn && (
              <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
                <img
                  src={userImage}
                  alt="用户头像"
                  style={{
                    width: "24px",
                    height: "24px",
                    marginRight: "8px",
                    borderRadius: "50%",
                  }}
                />
                <Typography variant="body2" sx={{ fontSize: "14px" }}>
                  {userInfo.user_name || "未填写姓名"}
                </Typography>

                <IconButton
                  aria-label="Menu button"
                  onClick={toggleDrawer(true)}
                  sx={{ ml: 1 }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  maxHeight: "80vh",
                  borderBottomLeftRadius: "16px",
                  borderBottomRightRadius: "16px",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "background.default" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* 导航按钮 */}
                <Box sx={{ mb: 2 }}>
                  <MenuItem
                    onClick={() => {
                      navigate("/root/campaign");
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    商品列表
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/root/launch");
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    上架商品
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      navigate("/root/about");
                      toggleDrawer(false)();
                    }}
                    sx={{
                      borderRadius: 1,
                      "&:hover": {
                        backgroundColor: "primary.light",
                        color: "primary.contrastText",
                      },
                    }}
                  >
                    关于我们
                  </MenuItem>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* 用户相关按钮 */}
                {isLoggedIn ? (
                  <>
                    <MenuItem
                      onClick={() => {
                        handleGoUser();
                        toggleDrawer(false)();
                      }}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        "&:hover": {
                          backgroundColor: "primary.light",
                          color: "primary.contrastText",
                        },
                      }}
                    >
                      个人主页
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        toggleDrawer(false)();
                      }}
                      sx={{
                        borderRadius: 1,
                        color: "error.main",
                        "&:hover": {
                          backgroundColor: "error.light",
                          color: "error.contrastText",
                        },
                      }}
                    >
                      退出登录
                    </MenuItem>
                  </>
                ) : (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Button
                      color="primary"
                      variant="contained"
                      fullWidth
                      onClick={() => {
                        handleSignInClick();
                        toggleDrawer(false)();
                      }}
                      sx={{ mb: 1 }}
                    >
                      登录
                    </Button>
                    <Button
                      color="primary"
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        handleSignUpClick();
                        toggleDrawer(false)();
                      }}
                    >
                      注册
                    </Button>
                  </Box>
                )}
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
