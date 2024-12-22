import RssFeedRoundedIcon from "@mui/icons-material/RssFeedRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Button,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import Alert from "@mui/material/Alert";
import { useNavigate } from 'react-router-dom';
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import OutlinedInput from "@mui/material/OutlinedInput";
import Snackbar, { SnackbarCloseReason } from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import axios from "axios";
import * as React from "react";
import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  Ref,
} from "react";
import "./MainContent.css"
import { useLocation } from 'react-router-dom';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { Commodity } from "../../../types/interfaces";

interface SearchProps {
  setCommodities: React.Dispatch<React.SetStateAction<Commodity[]>>;
  setAllCommodities: React.Dispatch<React.SetStateAction<Commodity[]>>;
  setLoad: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * 将本地文件路径转换为可访问的 HTTP URL
 * @param {string} localPath - 本地文件路径，例如 "D:\\study-at-zju\\BS\\Commodity parity\\frontend\\src\\asset\\pricehis\\price_trend_c46e3dad8500b93eb82da62bad818f17.png"
 * @returns {string} 转换后的 HTTP URL，例如 "http://127.0.0.1/pricehis/price_trend_c46e3dad8500b93eb82da62bad818f17.png"
 */
function convertToHttpUrl(localPath: string) {
  // 定义本地路径的关键目录标识（映射路径起始位置）
  const keyDir = "pricehis";
  const baseUrl = "http://127.0.0.1/pricehis/";

  // 将反斜杠替换为正斜杠，确保路径格式统一
  const normalizedPath = localPath.replace(/\\/g, "/");

  // 找到关键目录的位置
  const keyDirIndex = normalizedPath.indexOf(keyDir);

  if (keyDirIndex === -1) {
    console.error("关键目录未找到，无法转换路径");
    return null;
  }

  // 提取从关键目录开始的相对路径
  const relativePath = normalizedPath.substring(keyDirIndex + keyDir.length + 1); // +1 是为了去除斜杠

  // 拼接完整的 HTTP URL
  const httpUrl = `${baseUrl}${relativePath}`;
  return httpUrl;
}

export const Search = forwardRef((props: SearchProps, ref: Ref<any>) => {
  const { setAllCommodities, setCommodities, setLoad } = props;
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleInputChange = (event: any) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    if (newValue.length >= 2) {
      searchSuggestions(newValue);
      setShowSuggestions(true); // 输入时显示推荐表
    } else {
      setShowSuggestions(false); // 清空输入时隐藏推荐表
    }
  };

  //点击推荐搜索
  const handleSuggestionClick = (suggestion: string) => {
    // console.log("点击:",suggestion);

    setInputValue(suggestion);
    setShowSuggestions(false); // 点击推荐项时隐藏推荐表
    searchProducts(suggestion); //直接用suggestion作为参数传给searchProducts去搜索，而非让它用当前的InputValue，避免闭包陷阱
  };

  //搜索推荐
  const searchSuggestions = async (query: string) => {
    try {
      const response = await axios.get(
        "http://localhost:80/search/get_keywords",
        {
          params: { keywords: query },
        }
      );
      setSuggestions(response.data.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };

  // 处理输入时回车
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      setShowSuggestions(false); // 点击推荐项时隐藏推荐表
      searchProducts(inputValue);
    }
  };

  // 搜索商品
  const searchProducts = async (query: string) => {
    console.log("开始搜索：", query);

    try {
      setLoad(true);
      const response = await axios.get(
        "http://localhost:80/search/ajax_search_product_list",
        {
          params: {
            keywords: query,
            sort: "综合",
            price_min: "",
            price_max: "",
            mall_id: "",
            category_id: "",
          },
        }
      );
      setTimeout(() => {
        setLoad(false);
      }, 1000); // 延迟 700 毫秒

      const updatedCommodities = response.data.data.map(
        (commodity: Commodity) => {
          // 截断商品标题
          const truncatedTitle =
            commodity.article_title.length > 50
              ? `${commodity.article_title.slice(0, 50)}...`
              : commodity.article_title;

          return {
            ...commodity,
            article_title: truncatedTitle, // 替换为截断后的标题
            mall_logo_url: commodity.mall_logo_url.replace(
              "https://",
              "http://localhost:80/image_proxy/"
            ),
            article_pic: commodity.article_pic.replace(
              "https://",
              "http://localhost:80/image_proxy/"
            ),
          };
        }
      );
      console.log("搜索商品：", updatedCommodities);

      setCommodities(updatedCommodities);
      setAllCommodities(updatedCommodities);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // 暴露给父组件的接口
  useImperativeHandle(ref, () => ({
    searchProducts,
  }));

  //判断是否点到外面
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  //推荐高光
  const highlightMatch = (text: string, query: string) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} style={{ color: "red", fontWeight: "bold" }}>
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <Box ref={containerRef} sx={{ position: "relative", width: "100%" }}>
      <FormControl
        sx={{ width: { xs: "100%", md: "130ch" } }}
        variant="outlined"
      >
        <OutlinedInput
          size="small"
          id="search"
          onKeyDown={handleKeyDown}
          placeholder="Search for products to start a price comparison online..."
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)} // 点击搜索框时显示推荐表
          startAdornment={
            <InputAdornment position="start" sx={{ color: "text.primary" }}>
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          }
          inputProps={{
            "aria-label": "search",
          }}
        />
      </FormControl>

      {showSuggestions && suggestions.length > 0 && (
        <List
          sx={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            maxHeight: "300px",
            overflowY: "auto",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
            bgcolor: "background.paper",
            borderRadius: "8px",
            zIndex: 1000,
          }}
        >
          {suggestions.map((suggestion, index) => (
            <ListItem
              key={index}
              disablePadding
              sx={{
                "&:hover": {
                  bgcolor: "rgba(0, 0, 0, 0.04)",
                },
              }}
            >
              <ListItemButton onClick={() => handleSuggestionClick(suggestion)}>
                <Typography
                  variant="body2"
                  sx={{ padding: "4px 16px", whiteSpace: "nowrap" }}
                >
                  {highlightMatch(suggestion, inputValue)}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
});

export default function MainContent() {
  const navigate = useNavigate(); // 初始化导航钩子
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(false);
  const [curdetail, setCurdetail] = React.useState<Commodity | null>(null);
  const [pricehis, setPricehis] = useState<string | null>(null); // 存储历史价格数据的 img
  const searchRef = useRef<any>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const location = useLocation();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const handleIconClick = () => {
    console.log("点击");
    console.log(searchRef.current);
    if (searchRef.current) {
      console.log(searchRef.current);
      searchRef.current.searchProducts(); // 调用子组件的 searchProducts 方法
    }
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const [commodities, setCommodities] = useState<Commodity[]>([
    {
      article_title:
        "乐扣乐扣保温杯男士316不锈钢大容量杯子女士高颜值水杯双饮保温杯 【双饮口】摩卡棕1000ML",
      article_mall: "京东",
      mall_logo_url:
        "http://localhost:80/image_proxy/qny.smzdm.com/202201/26/61f0f374020dd3641.png",
      article_price: 109,
      wiki_id: 46253720,
      hash_id: "4qeprz0",
      comment_count: 0,
      page_price: 109,
      article_pic:
        "http://localhost:80/image_proxy/qny.smzdm.com/202411/14/6735d4b5a43839510.png",
      link: "https://item.jd.com/100066625685.html",
      go_link: "https://go.smzdm.com/8500b93eb82da62b/ca_aa_hy_0_0_0_0_0_0",
      coupon: [],
      type: "百科",
      mall_id: 183,
      article_tag_list: [],
      show_btn: 0,
    },
    {
      article_title:
        "日康宝宝水杯儿童吸管杯幼儿喝水杯子婴儿6个月以上外出学饮杯",
      article_mall: "拼多多",
      mall_logo_url:
        "http://localhost:80/image_proxy/qneimg.smzdm.com/201907/09/5d246a5a419331130.png",
      article_price: 36.99,
      wiki_id: 46252172,
      hash_id: "1xdep61",
      comment_count: 0,
      page_price: 36.99,
      article_pic:
        "http://localhost:80/image_proxy/y.zdmimg.com/202411/15/6736bed0df6e11463.jpg",
      link: "https://mobile.yangkeduo.com/goods.html?goods_id=594220115623",
      go_link: "https://go.smzdm.com/05e406d9c5d32be6/ca_aa_hy_0_0_0_0_0_0",
      coupon: [],
      type: "百科",
      mall_id: 8645,
      article_tag_list: [],
      show_btn: 0,
    },
    {
      article_title:
        "BABLOV花伴森保温杯女士吸管杯316不锈钢水杯便携水壶户外保温杯 （双饮盖+杯套）航海宝藏号550ml",
      article_mall: "京东",
      mall_logo_url:
        "http://localhost:80/image_proxy/qny.smzdm.com/202201/26/61f0f374020dd3641.png",
      article_price: 149,
      wiki_id: 46253281,
      hash_id: "re7d990",
      comment_count: 0,
      page_price: 149,
      article_pic:
        "http://localhost:80/image_proxy/qny.smzdm.com/202411/15/673700b62c9118652.jpg",
      link: "https://item.jd.com/100148321150.html",
      go_link: "https://go.smzdm.com/9cfb5324e23e8b74/ca_aa_hy_0_0_0_0_0_0",
      coupon: [
        {
          title: "满61元减3元",
          is_show: 1,
          link: "https://coupon.m.jd.com/coupons/show.action?linkKey=AAROH_xIpeffAs_-naABEFoeZEdRXlKcZiVn94lCr-OuUzW_cMk0dn8zx0pcm4Nn7nRqqB2QQYyPKvG4MEr3acoHOWbqEA",
          go_link: "https://go.smzdm.com/0527efdc46243557/ca_aa_hy_0_0_0_0_0_0",
          article_mall: "京东",
        },
      ],
      type: "百科",
      mall_id: 183,
      article_tag_list: ["低于双11"],
      show_btn: 2,
    },
  ]); // Campaign[] is an array of Campaign objects

  // 原始 campaigns 数据状态
  const [allCommodity, setAllCommodity] = useState<Commodity[]>([
    {
      article_title:
        "乐扣乐扣保温杯男士316不锈钢大容量杯子女士高颜值水杯双饮保温杯 【双饮口】摩卡棕1000ML",
      article_mall: "京东",
      mall_logo_url:
        "http://localhost:80/image_proxy/qny.smzdm.com/202201/26/61f0f374020dd3641.png",
      article_price: 109,
      wiki_id: 46253720,
      hash_id: "4qeprz0",
      comment_count: 0,
      page_price: 109,
      article_pic:
        "http://localhost:80/image_proxy/qny.smzdm.com/202411/14/6735d4b5a43839510.png",
      link: "https://item.jd.com/100066625685.html",
      go_link: "https://go.smzdm.com/8500b93eb82da62b/ca_aa_hy_0_0_0_0_0_0",
      coupon: [],
      type: "百科",
      mall_id: 183,
      article_tag_list: [],
      show_btn: 0,
    },
    {
      article_title:
        "日康宝宝水杯儿童吸管杯幼儿喝水杯子婴儿6个月以上外出学饮杯",
      article_mall: "拼多多",
      mall_logo_url:
        "http://localhost:80/image_proxy/qneimg.smzdm.com/201907/09/5d246a5a419331130.png",
      article_price: 36.99,
      wiki_id: 46252172,
      hash_id: "1xdep61",
      comment_count: 0,
      page_price: 36.99,
      article_pic:
        "http://localhost:80/image_proxy/y.zdmimg.com/202411/15/6736bed0df6e11463.jpg",
      link: "https://mobile.yangkeduo.com/goods.html?goods_id=594220115623",
      go_link: "https://go.smzdm.com/05e406d9c5d32be6/ca_aa_hy_0_0_0_0_0_0",
      coupon: [],
      type: "百科",
      mall_id: 8645,
      article_tag_list: [],
      show_btn: 0,
    },
    {
      article_title:
        "BABLOV花伴森保温杯女士吸管杯316不锈钢水杯便携水壶户外保温杯 （双饮盖+杯套）航海宝藏号550ml",
      article_mall: "京东",
      mall_logo_url:
        "http://localhost:80/image_proxy/qny.smzdm.com/202201/26/61f0f374020dd3641.png",
      article_price: 149,
      wiki_id: 46253281,
      hash_id: "re7d990",
      comment_count: 0,
      page_price: 149,
      article_pic:
        "http://localhost:80/image_proxy/qny.smzdm.com/202411/15/673700b62c9118652.jpg",
      link: "https://item.jd.com/100148321150.html",
      go_link: "https://go.smzdm.com/9cfb5324e23e8b74/ca_aa_hy_0_0_0_0_0_0",
      coupon: [
        {
          title: "满61元减3元",
          is_show: 1,
          link: "https://coupon.m.jd.com/coupons/show.action?linkKey=AAROH_xIpeffAs_-naABEFoeZEdRXlKcZiVn94lCr-OuUzW_cMk0dn8zx0pcm4Nn7nRqqB2QQYyPKvG4MEr3acoHOWbqEA",
          go_link: "https://go.smzdm.com/0527efdc46243557/ca_aa_hy_0_0_0_0_0_0",
          article_mall: "京东",
        },
      ],
      type: "百科",
      mall_id: 183,
      article_tag_list: ["低于双11"],
      show_btn: 2,
    },
  ]);

  // 原始 campaigns 数据状态
  const [load, setLoad] = React.useState(true);

  useEffect(() => {
    try {
      // gitimg();
    } catch (err: any) {
      console.error("查看错误", err);
    } finally {
      // 无论成功与否，延迟 700 毫秒再执行 setLoad(false)
      setTimeout(() => {
        setLoad(false);
      }, 700); // 延迟 700 毫秒
    }
  }, []);

  // 处理点击 Chip 的逻辑
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    const selectedLabel = (event.target as HTMLElement).innerText;
    // document.body.style.backgroundColor = '';

    if (selectedLabel === "All | 综合") {
      // 显示所有 campaign
      setCommodities(allCommodity);
    } else {
      // 根据 platform 进行筛选
      setCommodities(
        allCommodity.filter(
          (commodity) =>
            commodity.article_mall === selectedLabel.split(" ")[0] ||
            commodity.article_mall === selectedLabel.split(" ")[2]
        )
      );
    }
  };

  // 处理点击 Detail 的逻辑
  const handleClickDetail =
    (commodity: Commodity) => async (event: React.MouseEvent<HTMLElement>) => {
      event.stopPropagation(); // 阻止事件冒泡

      console.log("commodity: ", commodity);
      setCurdetail(commodity); // 设置当前商品详情
      setDetail(true); // 打开详情弹窗
      setPricehis(null);
      try {
        const response = await axios.post(
          "http://localhost:8000/commodity/price-trend/",
          {
            url: commodity.link,
          }
        );

        // 检查响应状态码
        if (response.status !== 200) {
          throw new Error(`Error: ${response.status}`);
        }

        // const result = response.data.screenshots.cropped;
        const result = convertToHttpUrl(response.data.screenshots.cropped);
        console.log("Price History:", result);
        // 设置历史价格 HTML
        setPricehis(result);
      } catch (error) {
        console.error("Failed to fetch price history:", error);
        setPricehis(null); // 清空数据以防止显示旧数据
      }
    };

  const handleNavigate = (link: string) => {
    window.open(link, "_blank");
  };

  useEffect(() => {
    const state = location.state as { from: string; success?: boolean } | null;
    console.log("state:", state);
    if (state?.from === 'login' && state.success) {
      setLoginSuccess(true);
      setTimeout(() => setLoginSuccess(false), 6000);
    } else if (state?.from === 'register' && state.success) {
      setRegisterSuccess(true);
      setTimeout(() => setRegisterSuccess(false), 6000);
    }
  }, [location]);

  const handleFavorite = async (event: React.MouseEvent, commodity: Commodity) => {
    event.stopPropagation();
    
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (!userInfo.user_id) {
      navigate('/signIn');
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': userInfo.token
        },
        withCredentials: true
      };
      console.log("favorites:", favorites);
      console.log("commodity:", commodity);
      if (favorites.has(commodity.wiki_id)) {
        const response = await axios.post('http://127.0.0.1:8000/user/remove_favorite/', {
          user_id: userInfo.user_id,
          product_id: commodity.wiki_id
        }, config);
        if (response.data.status === 'success') {
          const newFavorites = new Set(favorites);
          newFavorites.delete(commodity.wiki_id);
          setFavorites(newFavorites);
        }
      } else {
        const response = await axios.post('http://127.0.0.1:8000/user/add_favorite/', {
          user_id: userInfo.user_id,
          product_id: commodity.wiki_id,
          platform_id: commodity.mall_id,
          price: commodity.article_price,
          article_mall: commodity.article_mall,
          article_title: commodity.article_title,
          article_pic: commodity.article_pic,
          link: commodity.link
        }, config);
        if (response.data.status === 'success') {
          const newFavorites = new Set(favorites);
          newFavorites.add(commodity.wiki_id);
          setFavorites(newFavorites);
        }
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  useEffect(() => {
    const fetchFavorites = async () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      if (!userInfo.user_id) return;

      try {
        const response = await axios.get(`http://127.0.0.1:8000/user/get_favorites/?user_id=${userInfo.user_id}`);
        if (response.data.status === 'success') {
          const favSet = new Set(response.data.data.map((fav: any) => Number(fav.product_id)));
          setFavorites(favSet as Set<number>);
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error);
      }
    };

    fetchFavorites();
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity="warning"
          variant="filled"
          sx={{ width: "100%" }}
        >
          The current list is empty. Please check if you have connected your
          wallet.
        </Alert>
      </Snackbar>
      <Snackbar 
        open={loginSuccess} 
        autoHideDuration={6000} 
        onClose={() => setLoginSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setLoginSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          登录成功！欢迎回来
        </Alert>
      </Snackbar>

      <Snackbar 
        open={registerSuccess} 
        autoHideDuration={6000} 
        onClose={() => setRegisterSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setRegisterSuccess(false)}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          注册成功！欢迎加入我们
        </Alert>
      </Snackbar>
      <Backdrop
        sx={(theme) => ({ color: "#fff", zIndex: theme.zIndex.drawer + 1 })}
        open={load}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <div>
        <Typography variant="h2" gutterBottom>
          Hotest&Latest <b style={{ color: "#ff914d" }}>PriceScout</b> Commodity
          <br /> | 最热门&最新 商品
        </Typography>
        <Divider />
      </div>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 1,
          width: { xs: "100%", md: "fit-content" },
          position: "relative", // 保持推荐列表正确定位
          overflow: "visible",
        }}
      >
        <Search
          ref={searchRef} //重要，searchRef的绑定
          setAllCommodities={setAllCommodity}
          setCommodities={setCommodities}
          setLoad={setLoad}
        />
        <IconButton
          size="small"
          aria-label="RSS feed"
          onClick={handleIconClick}
        >
          <RssFeedRoundedIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", md: "row" },
          width: "100%",
          justifyContent: "space-between",
          alignItems: { xs: "start", md: "center" },
          gap: 0,
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            flexDirection: "row",
            gap: 0,
            overflow: "auto",
          }}
        >
          <Chip
            onClick={handleClick}
            size="medium"
            label="All | 综合"
            sx={
              {
                // backgroundColor: 'transparent',
                // border: 'none',
              }
            }
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="JD | 京东"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Tmall | 天猫"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Taobao | 淘宝"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Pinduoduo | 拼多多"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
          <Chip
            onClick={handleClick}
            size="medium"
            label="Others | 其他"
            sx={{
              backgroundColor: "transparent",
              border: "none",
            }}
          />
        </Box>
      </Box>
      {commodities.length >= 1 ? (
        commodities.map((commodity) => (
          <Card
            key={commodity.hash_id}
            variant="outlined"
            onClick={() => handleNavigate(commodity.go_link)}
            sx={{
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 2,
              borderRadius: 2,
              boxShadow: 1,
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* 商品图片 */}
            <CardMedia
              component="img"
              alt={commodity.article_title}
              src={commodity.article_pic}
              sx={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            {/* 商品信息 */}
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: "bold",
                }}
              >
                <img
                  src={commodity.mall_logo_url}
                  alt={commodity.article_mall}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                  }}
                />
                {commodity.article_mall}
              </Typography>
              <Typography
                variant="subtitle1"
                noWrap
                title={commodity.article_title}
                sx={{ fontWeight: "bold", lineHeight: 1.5, mt: 1 }}
              >
                {commodity.article_title}
              </Typography>
              <Typography
                variant="body1"
                color="error"
                sx={{ fontWeight: "bold", fontSize: "1.2rem", mt: 1 }}
              >
                ¥{commodity.article_price} 到手价
              </Typography>
              {/* 优惠信息 */}
              {commodity.coupon.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {commodity.coupon.map((coupon) => (
                    <Chip
                      key={coupon.link}
                      label={coupon.title}
                      color="success"
                      size="small"
                      component="a"
                      href={coupon.go_link}
                      target="_blank"
                      clickable
                      sx={{ fontSize: "0.75rem" }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
            {/* 按钮区域 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >
              {!(
                commodity.show_btn === 1 &&
                commodity.article_tag_list[0] === "低于常卖价"
              ) && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{ textTransform: "none", fontWeight: "bold",marginBottom: 1}}
                    onClick={handleClickDetail(commodity)}
                  >
                    价格趋势
                  </Button>
                )}
              {commodity.show_btn === 1 &&
                commodity.article_tag_list[0] === "低于常卖价" && (
                  <Button
                    color="error"
                    onClick={handleClickDetail(commodity)}
                    sx={{
                      fontWeight: "bold",
                      border: "1px solid red",
                      padding: "4px 8px",
                      borderRadius: 1,
                      textAlign: "center",
                    }}
                  >
                    低于常卖价
                  </Button>
                )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, pb: 1 }}>
              <IconButton 
                onClick={(e) => handleFavorite(e, commodity)}
                color={favorites.has(commodity.wiki_id) ? "primary" : "default"}
              >
                {favorites.has(commodity.wiki_id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
          </Card>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          没有找到相关商品，请尝试更精确的搜索。
        </Typography>
      )}
      {detail === true && curdetail !== null ? (
        <Drawer
          anchor="bottom"
          open={detail}
          onClose={() => setDetail(false)}
          PaperProps={{
            sx: {
              height: "85vh", // 设置页面高度
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            },
          }}
        >
          {/* 顶部标题 */}
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Typography variant="h6">{curdetail.article_title}</Typography>
            <Typography variant="body1" color="text.secondary">
              {curdetail.article_mall}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* 商品详情 */}
          <Card
            key={curdetail.hash_id}
            variant="outlined"
            onClick={() => handleNavigate(curdetail.go_link)}
            sx={{
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingRight: 2,
              marginLeft: 5,
              marginBottom: 1,
              marginRight: 5,
              borderRadius: 2,
              boxShadow: 1,
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* 商品图片 */}
            <CardMedia
              component="img"
              alt={curdetail.article_title}
              src={curdetail.article_pic}
              sx={{
                width: 120,
                height: 120,
                objectFit: "cover",
                borderRadius: "8px 0 0 8px", // 左上和左下有弧度，右侧为直角
              }}
            />
            {/* 商品信息 */}
            <CardContent
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                color="primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontWeight: "bold",
                }}
              >
                <img
                  src={curdetail.mall_logo_url}
                  alt={curdetail.article_mall}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                  }}
                />
                {curdetail.article_mall}
              </Typography>
              <Typography
                variant="subtitle1"
                noWrap
                title={curdetail.article_title}
                sx={{ fontWeight: "bold", lineHeight: 1.5, mt: 1 }}
              >
                {curdetail.article_title}
              </Typography>
              <Typography
                variant="body1"
                color="error"
                sx={{ fontWeight: "bold", fontSize: "1.2rem", mt: 1 }}
              >
                ¥{curdetail.article_price} 到手价
              </Typography>
              {/* 优惠信息 */}
              {curdetail.coupon.length > 0 && (
                <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
                  {curdetail.coupon.map((coupon) => (
                    <Chip
                      key={coupon.link}
                      label={coupon.title}
                      color="success"
                      size="small"
                      component="a"
                      href={coupon.go_link}
                      target="_blank"
                      clickable
                      sx={{ fontSize: "0.75rem" }}
                    />
                  ))}
                </Box>
              )}
            </CardContent>
            {/* 按钮区域 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "center",
              }}
            >

              <Button
                color="error"
                onClick={handleClickDetail(curdetail)}
                sx={{
                  fontWeight: "bold",
                  border: "1px solid red",
                  padding: "4px 8px",
                  borderRadius: 1,
                  textAlign: "center",
                }}
              >
                收藏到购物车
              </Button>

            </Box>
          </Card>

          {/* 历史价格信息 */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">{(pricehis === null || pricehis === "") ? ("正努力帮你获取中....") : ("价格走势(单位：元)")}</Typography>

            <Box
              sx={{
                padding: "0px",
                position: "relative",
                width: "100%",
                height: "300px",
                margin: "0px auto",
                display: "flex",
                justifyContent: "center"
              }}
            >
              {(pricehis === null || pricehis === "") ? (
                /* From Uiverse.io by vinodjangid07 */
                <div className="loader">
                  <div className="truckWrapper">
                    <div className="truckBody">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 198 93"
                        className="trucksvg"
                      >
                        <path
                          strokeWidth="3"
                          stroke="#282828"
                          fill="#F83D3D"
                          d="M135 22.5H177.264C178.295 22.5 179.22 23.133 179.594 24.0939L192.33 56.8443C192.442 57.1332 192.5 57.4404 192.5 57.7504V89C192.5 90.3807 191.381 91.5 190 91.5H135C133.619 91.5 132.5 90.3807 132.5 89V25C132.5 23.6193 133.619 22.5 135 22.5Z"
                        ></path>
                        <path
                          strokeWidth="3"
                          stroke="#282828"
                          fill="#7D7C7C"
                          d="M146 33.5H181.741C182.779 33.5 183.709 34.1415 184.078 35.112L190.538 52.112C191.16 53.748 189.951 55.5 188.201 55.5H146C144.619 55.5 143.5 54.3807 143.5 53V36C143.5 34.6193 144.619 33.5 146 33.5Z"
                        ></path>
                        <path
                          strokeWidth="2"
                          stroke="#282828"
                          fill="#282828"
                          d="M150 65C150 65.39 149.763 65.8656 149.127 66.2893C148.499 66.7083 147.573 67 146.5 67C145.427 67 144.501 66.7083 143.873 66.2893C143.237 65.8656 143 65.39 143 65C143 64.61 143.237 64.1344 143.873 63.7107C144.501 63.2917 145.427 63 146.5 63C147.573 63 148.499 63.2917 149.127 63.7107C149.763 64.1344 150 64.61 150 65Z"
                        ></path>
                        <rect
                          strokeWidth="2"
                          stroke="#282828"
                          fill="#FFFCAB"
                          rx="1"
                          height="7"
                          width="5"
                          y="63"
                          x="187"
                        ></rect>
                        <rect
                          strokeWidth="2"
                          stroke="#282828"
                          fill="#282828"
                          rx="1"
                          height="11"
                          width="4"
                          y="81"
                          x="193"
                        ></rect>
                        <rect
                          strokeWidth="3"
                          stroke="#282828"
                          fill="#DFDFDF"
                          rx="2.5"
                          height="90"
                          width="121"
                          y="1.5"
                          x="6.5"
                        ></rect>
                        <rect
                          strokeWidth="2"
                          stroke="#282828"
                          fill="#DFDFDF"
                          rx="2"
                          height="4"
                          width="6"
                          y="84"
                          x="1"
                        ></rect>
                      </svg>
                    </div>
                    <div className="truckTires">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 30 30"
                        className="tiresvg"
                      >
                        <circle
                          strokeWidth="3"
                          stroke="#282828"
                          fill="#282828"
                          r="13.5"
                          cy="15"
                          cx="15"
                        ></circle>
                        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 30 30"
                        className="tiresvg"
                      >
                        <circle
                          strokeWidth="3"
                          stroke="#282828"
                          fill="#282828"
                          r="13.5"
                          cy="15"
                          cx="15"
                        ></circle>
                        <circle fill="#DFDFDF" r="7" cy="15" cx="15"></circle>
                      </svg>
                    </div>
                    <div className="road"></div>

                    <svg
                      xmlSpace="preserve"
                      viewBox="0 0 453.459 453.459"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      xmlns="http://www.w3.org/2000/svg"
                      id="Capa_1"
                      version="1.1"
                      fill="#000000"
                      className="lampPost"
                    >
                      <path
                        d="M252.882,0c-37.781,0-68.686,29.953-70.245,67.358h-6.917v8.954c-26.109,2.163-45.463,10.011-45.463,19.366h9.993
                            c-1.65,5.146-2.507,10.54-2.507,16.017c0,28.956,23.558,52.514,52.514,52.514c28.956,0,52.514-23.558,52.514-52.514
                            c0-5.478-0.856-10.872-2.506-16.017h9.992c0-9.354-19.352-17.204-45.463-19.366v-8.954h-6.149C200.189,38.779,223.924,16,252.882,16
                            c29.952,0,54.32,24.368,54.32,54.32c0,28.774-11.078,37.009-25.105,47.437c-17.444,12.968-37.216,27.667-37.216,78.884v113.914
                            h-0.797c-5.068,0-9.174,4.108-9.174,9.177c0,2.844,1.293,5.383,3.321,7.066c-3.432,27.933-26.851,95.744-8.226,115.459v11.202h45.75
                            v-11.202c18.625-19.715-4.794-87.527-8.227-115.459c2.029-1.683,3.322-4.223,3.322-7.066c0-5.068-4.107-9.177-9.176-9.177h-0.795
                            V196.641c0-43.174,14.942-54.283,30.762-66.043c14.793-10.997,31.559-23.461,31.559-60.277C323.202,31.545,291.656,0,252.882,0z
                            M232.77,111.694c0,23.442-19.071,42.514-42.514,42.514c-23.442,0-42.514-19.072-42.514-42.514c0-5.531,1.078-10.957,3.141-16.017
                            h78.747C231.693,100.736,232.77,106.162,232.77,111.694z"
                      ></path>
                    </svg>
                  </div>
                </div>
              ) : (
                <div>
                  <img
                    src={pricehis} // 这里放入图片的 URL
                    alt="价格趋势"
                    width={1364}
                    height={866}
                    className='rounded-md bg-white p-2 sm:p-5 md:p-2 shadow-2xl ring-1 ring-gray-900/10'
                  />
                </div>
              )}

            </Box>
          </Box>
        </Drawer>
      ) : null}
    </Box>
  );
}
