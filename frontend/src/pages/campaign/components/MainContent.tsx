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

import { Commodity } from "../../../types/interfaces";

interface SearchProps {
  setCommodities: React.Dispatch<React.SetStateAction<Commodity[]>>;
  setAllCommodities: React.Dispatch<React.SetStateAction<Commodity[]>>;
  setLoad: React.Dispatch<React.SetStateAction<boolean>>;
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
            keywords: inputValue,
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
            commodity.article_title.length > 40
              ? `${commodity.article_title.slice(0, 40)}...`
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
  const [open, setOpen] = React.useState(false);
  const [detail, setDetail] = React.useState(false);
  const searchRef = useRef<any>(null);

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
  const handleClickDetail = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation(); // 阻止事件冒泡
    setDetail(true);
  };

  const handleNavigate = (link: string) => {
    window.open(link, "_blank");
  };

  // 示例数据
  const data = {
    article_title: "SAMA 先马 XP850G 悟空版 ATX3白金牌电脑电源 850W",
    article_mall: "京东",
    mall_logo_url:
      "http://localhost:80/image_proxy/qny.smzdm.com/202201/26/61f0f374020dd3641.png_d320.jpg",
    shop_name: "先马SAMA京东自营旗舰店",
    article_price: 459,
    article_pic:
      "http://localhost:80/image_proxy/y.zdmimg.com/202410/14/670d00f8488356785.jpg",
    link: "https://item.jd.com/100145136516.html",
    important_price_info: [
      {
        article_title: "常卖价",
        article_price: 749,
        article_date: "2024.10.30",
      },
      {
        article_title: "历史最低",
        article_price: 373.16,
        article_date: "2024.11.06",
      },
    ],
  };

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
              {commodity.show_btn === 1 && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                  onClick={handleClickDetail}
                >
                  价格趋势
                </Button>
              )}
              {commodity.show_btn === 0 && (
                <Button
                  color="error"
                  onClick={handleClickDetail}
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
          </Card>
        ))
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          没有找到相关商品，请尝试更精确的搜索。
        </Typography>
      )}
      {detail === true ? (
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
            <Typography variant="h6">{data.article_title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {data.shop_name} · {data.article_mall}
            </Typography>
            <Divider sx={{ mt: 2 }} />
          </Box>

          {/* 商品详情 */}
          <Card sx={{ m: 2 }}>
            <CardMedia
              component="img"
              height="180"
              image={data.article_pic}
              alt={data.article_title}
            />
            <CardContent>
              <Typography variant="h6" color="primary">
                当前价格：¥{data.article_price}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                点击购买：
                <a href={data.link} target="_blank" rel="noopener noreferrer">
                  前往京东
                </a>
              </Typography>
            </CardContent>
          </Card>

          {/* 历史价格信息 */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1">历史价格趋势：</Typography>
            {data.important_price_info.map((info, index) => (
              <Box
                key={index}
                sx={{ display: "flex", justifyContent: "space-between", my: 1 }}
              >
                <Typography variant="body2">{info.article_title}</Typography>
                <Typography variant="body2">
                  ¥{info.article_price} · {info.article_date}
                </Typography>
              </Box>
            ))}
          </Box>
        </Drawer>
      ) : null}
    </Box>
  );
}
