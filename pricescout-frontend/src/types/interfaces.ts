// types.ts
// 子组件的上下文类型【相当于props接口】

export interface ChildProps {
  prop_account: string;
}

export interface OutletContext {
  account: string;
}

export interface Commodity {
    "article_title": string;
    "article_mall": string;
    "mall_logo_url": string;
    "article_price": number;
    "wiki_id": number;
    "hash_id": string;
    "comment_count": number;
    "page_price": number;
    "article_pic": string;
    "link": string;
    "go_link": string;
    "coupon": {
        "title": string;
        "is_show": number;
        "link": string;
        "go_link": string;
        "article_mall": string;
    }[];
    "type": string;
    "mall_id": number;
    "article_tag_list": string[];
    "show_btn": number;
}

export interface CampaignType {
    id: number;
    title: string;
    description: string;
    details: string;
    target: number;
    current: number;
    createdAt: Date;
    deadline: Date;
    beneficiary: string;
    launcher: string;
    status: string;
    [key: string]: any; // 允许其他属性，值的类型可以是任意
}

export interface ApplicationProps {
  id: number;
  address: string;
  name: string;
  idCard: string;
  phone: string;
  description: string;
  details: string;
  createdAt: Date;
  status: string;
  [key: string]: any; // 允许其他属性，值的类型可以是任意
}

// enum Status {
//     Launched,
//     Fundraising,
//     Rejected,
//     LimitReached, //金额或者是时间
//     Completed,
//     Revoked
// }

export const Status = ['Launched','Fundraising','Rejected','LimitReached','Completed','Revoked'];