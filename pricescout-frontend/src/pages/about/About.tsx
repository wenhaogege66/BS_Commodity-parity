import { Box, Container, CssBaseline, Divider, Paper, Typography } from "@mui/material";
import { ReactComponent as MySvg } from '../../asset/PriceScout.svg';
import { useEffect } from "react";

export default function About() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <div>
            <CssBaseline enableColorScheme />
            <Container
                maxWidth="lg"
                component="main"
                sx={{ display: 'flex', flexDirection: 'column', my: 16, gap: 4 }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: "flex-end", gap: 4 }}>
                    <div>
                        <Typography variant="h2" gutterBottom>
                            About <b>Us</b> 
                            <br />| 关于我们
                        </Typography>
                        <Divider />
                        <Typography>
                            Everything about PriceScout -- Your Smart Shopping Assistant.
                            <br />关于比价小子的一切 -- 您的智能购物助手。
                        </Typography>
                    </div>
                    <Box style={{ height: 200, width: 500, marginRight: 2, display: 'flex', alignItems: 'flex-start', justifyContent: 'start' }}>
                        <MySvg style={{ height: 150, width: 1000 }} />
                    </Box>
                </Box>
                <Paper sx={{ p: 4, gap: 1, display: "flex", flexDirection: "column" }}>
                    <Typography variant="h4" gutterBottom>
                        项目介绍：PriceScout - 比价小子
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        在当今电商平台林立的时代，同一商品在不同平台往往会有不同的价格。消费者想要找到最优惠的价格，往往需要在多个平台之间来回切换比较，这个过程既耗时又费力。为了解决这个问题，我们推出了"比价小子"——一个智能化的比价平台，旨在帮助用户快速找到心仪商品的最佳购买时机和渠道。
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        核心功能
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        1. 多平台比价：实时对比主流电商平台（如京东、天猫、淘宝、拼多多等）的商品价格，帮您找到最优惠的选择。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        2. 历史价格追踪：记录并展示商品的历史价格走势，帮助用户判断当前是否是购买的好时机。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        3. 智能收藏提醒：用户可以收藏感兴趣的商品，当价格达到理想值时获得通知。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        4. 优惠券整合：自动收集和展示各平台的优惠券信息，最大化用户的实际优惠。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        5. 商品评价汇总：整合各平台的用户评价，提供全面的购买参考。
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        技术优势
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        - 实时数据更新：采用先进的爬虫技术，确保价格信息的实时性和准确性。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        - 智能分析系统：运用数据分析技术，为用户提供个性化的购物建议。
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        - 用户友好界面：简洁直观的设计，让用户轻松找到所需信息。
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        我们的愿景
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        "比价小子"致力于成为用户最信赖的购物决策助手。我们希望通过技术创新，让每一位用户都能便捷地找到最适合自己的商品，享受明智的消费体验。我们相信，理性消费不仅能让购物更经济，也能推动市场更加健康发展。
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        未来展望
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        我们将持续优化和升级平台功能，包括：
                        - 引入AI智能分析，提供更精准的价格预测
                        - 扩展更多电商平台的覆盖范围
                        - 开发移动端应用，提供更便捷的服务
                        - 建立用户社区，促进购物经验分享
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                        联系我们
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        如果您有任何问题、建议或合作意向，欢迎随时联系我们！    
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        邮箱: wenhaogege66@gmail.com
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                        手机: 18786980391
                    </Typography>
                </Paper>
            </Container>
        </div>
    )
}
