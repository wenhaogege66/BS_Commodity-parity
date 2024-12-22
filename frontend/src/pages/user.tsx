import axios from "axios";
import { useEffect, useState } from "react";

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
  CardMedia,
  Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Application from "../component/application";
import Applications from "../component/applications";
import "../styles/user.css"; // 确保路径正确
// import SimpleCollapse from '../component/try';
import "./user.css";
import FavoriteIcon from '@mui/icons-material/Favorite';
import { backendAxios } from '../config/api.config';

export default function User() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const [selectedIndex, setSelectedIndex] = useState("已收藏的商品");
  const btnlist = (
    userInfo.role === "admin"
      ? ["消息列表", "已收藏的商品", "我上架的", "商家申请审批"]
      : userInfo.role === "beneficiary"
        ? ["消息列表", "购物车", "已收藏的商品", "我上架的"]
        : [
            "消息列表",
            "购物车",
            "已收藏的商品",
            "我上架的",
            "申请成为商家",
          ]
  );

  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.user_id) return;

    try {
      const response = await backendAxios.get(`/user/get_favorites/?user_id=${userInfo.user_id}`);
      if (response.data.status === 'success') {
        setFavorites(response.data.data);
      }
    } catch (error) {
      console.error('获取收藏列表失败:', error);
    }
  };

  useEffect(() => {
    if (selectedIndex === "已收藏的商品") {
      fetchFavorites();
    }
  }, [selectedIndex]);

  const handleUnfavorite = async (productId: number) => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.user_id) return;

    try {
      const response = await backendAxios.post('/user/remove_favorite/', {
        user_id: userInfo.user_id,
        product_id: productId
      });

      if (response.data.status === 'success') {
        fetchFavorites();
      }
    } catch (error) {
      console.error('取消收藏失败:', error);
    }
  };

  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: "flex", flexDirection: "column", my: 16, gap: 4 }}
    >
      <CssBaseline enableColorScheme />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 4,
          overflow: "auto",
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "30%",
            gap: 4,
          }}
          position="sticky"
        >
          <Paper
            elevation={3}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              p: 4,
              justifySelf: "start",
              maxWidth: "300px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center", // This centers both horizontally
                justifyContent: "center", // This centers both vertically
                textAlign: "center", // Ensures the text is centered inside the chip
              }}
            >
              <Avatar
                src={"../../../img/user.png"}
                alt={userInfo.username}
                sx={{
                  width: 80,
                  height: 80,
                  mb: 2,
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                }}
              />
              <Chip
                label={
                  userInfo.role === "admin"
                    ? "管理员"
                    : userInfo.role === "beneficiary"
                      ? "受益人"
                      : userInfo.role === "third-party"
                        ? "第三方"
                        : "普通用户"
                }
                sx={{
                  fontWeight: "bold",
                  width: 77,
                  height: 23,
                  textAlign: "center", // Aligns the text inside the Chip
                  marginTop: "-35px",
                  zIndex: 2,
                  color: "white",
                  backgroundColor: "primary.main",
                  opacity: 0.9,
                }}
                onClick={() => {
                  if (userInfo.role === "third-party") {
                    navigate("/third-party");
                  }
                  
                }
              }
              />
            </Box>
            <Typography variant="h6">用户信息</Typography>
            <Tooltip title={userInfo.address} placement="top">
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <strong>用户ID : </strong>
                {userInfo.user_id}
              </Typography>
            </Tooltip>
            <Typography>
              <strong>姓名 : </strong> {userInfo.user_name}
            </Typography>
            <Tooltip title={userInfo.email} placement="top">
              <Typography
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <strong>邮箱 : </strong> {userInfo.email}
              </Typography>
            </Tooltip>
            <Divider />
            <nav aria-label="secondary mailbox folders">
              <List>
                {btnlist.map((text, index) => (
                  <ListItem disablePadding key={text}>
                    <ListItemButton
                      onClick={() => setSelectedIndex(text)}
                      sx={{
                        background:
                          selectedIndex === text
                            ? "linear-gradient(135deg, rgba(235, 150, 12, 0.2), rgba(255, 255, 255, 0))"
                            : "transparent",
                        boxShadow:
                          selectedIndex === text
                            ? "0 4px 8px rgba(235, 150, 12, 0.4)"
                            : "none",
                        borderRadius: "8px", // 添加圆角
                        transition:
                          "background 0.3s ease, box-shadow 0.3s ease, transform 0.2s",
                        "&:hover": {
                          background: "rgba(235, 150, 12, 0.2)",
                          transform:
                            selectedIndex === text
                              ? "scale(1.02)"
                              : "scale(1.05)", // 放大效果
                          boxShadow: "0 4px 12px rgba(235, 150, 12, 0.5)", // 加强阴影效果
                        },
                      }}
                    >
                      <ListItemText
                        primary={text}
                        primaryTypographyProps={{
                          fontWeight:
                            selectedIndex === text ? "bold" : "normal", // 加粗选中文字
                          color:
                            selectedIndex === text
                              ? "rgb(235, 150, 12)"
                              : "inherit", // 改变选中文字颜色
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </nav>
          </Paper>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "70%",
            justifySelf: "start",
            alignItems: "center",
          }}
        >
          <Card variant="outlined" sx={{ width: "100%" }}>
            <CardContent>
              {selectedIndex === "消息列表" ? (
                <Typography variant="h6">消息列表</Typography>
              ) : 
              selectedIndex === "购物车" ? (
                <Typography variant="h6">购物车</Typography>
              ) : 
              selectedIndex === "已收藏的商品" ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {favorites.length > 0 ? (
                    favorites.map((favorite: any) => (
                      <Card 
                        key={favorite.favorite_id}
                        sx={{
                          display: 'flex',
                          p: 2,
                          '&:hover': {
                            boxShadow: 6,
                            transition: 'box-shadow 0.3s ease-in-out'
                          }
                        }}
                      >
                        <CardMedia
                          component="img"
                          sx={{ 
                            width: 140,
                            height: 140,
                            objectFit: 'cover',
                            borderRadius: 1
                          }}
                          image={favorite.product_image}
                          alt={favorite.product_name}
                        />
                        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 2 }}>
                          <CardContent sx={{ flex: '1 0 auto', p: 0 }}>
                            <Typography variant="h6" component="div" gutterBottom>
                              {favorite.product_name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Chip 
                                label={favorite.platform_name}
                                size="small"
                                color="primary"
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="caption" color="text.secondary">
                                收藏于 {new Date(favorite.added_at).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  收藏时价格
                                </Typography>
                                <Typography variant="h6" color="primary">
                                  ¥{favorite.price_at_favorite}
                                </Typography>
                              </Box>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  当前价格
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  color={Number(favorite.current_price) < Number(favorite.price_at_favorite) ? "error" : "success"}
                                >
                                  ¥{favorite.current_price}
                                </Typography>
                              </Box>
                              {Number(favorite.current_price) < Number(favorite.price_at_favorite) && (
                                <Chip 
                                  label={`降价 ¥${(Number(favorite.price_at_favorite) - Number(favorite.current_price)).toFixed(2)}`}
                                  color="error"
                                  size="small"
                                />
                              )}
                            </Box>
                          </CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                            <Button
                              variant="outlined"
                              color="primary"
                              size="small"
                              onClick={() => console.log("favorite",favorite)}
                              sx={{ mr: 1 }}
                            >
                              查看商品
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleUnfavorite(favorite.product_id)}
                              startIcon={<FavoriteIcon />}
                            >
                              取消收藏
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    ))
                  ) : (
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        py: 4 
                      }}
                    >
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        暂无收藏商品
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => navigate('/root/campaign')}
                        sx={{ mt: 2 }}
                      >
                        去逛逛
                      </Button>
                    </Box>
                  )}
                </Box>
              ) : 
                selectedIndex === "我上架的" ? (
                  <Typography variant="h6">我上架的</Typography>
              ) : selectedIndex === "申请成为商家" ? (
                <Application />
              ) : (
                <Applications />
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
