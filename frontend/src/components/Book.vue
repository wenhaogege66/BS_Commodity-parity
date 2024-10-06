<!-- TODO: YOUR CODE HERE -->
<template>
  <el-scrollbar height="100%" style="width: 100%">
    <div
      style="
        margin-top: 20px;
        margin-left: 40px;
        font-size: 2em;
        font-weight: bold;
      "
    >
      图书管理
      <el-button
        class="newBookBox"
        type="primary"
        @click="searchVisible = true"
      >
        <el-icon style="height: 25px; width: 100%"
          ><Search style="height: 100%; width: 100%"
        /></el-icon>
      </el-button>
      <el-input
        v-model="toSearch"
        :prefix-icon="Search"
        placeholder="快捷搜索"
        style="
          width: 15vw;
          min-width: 150px;
          margin-left: 30px;
          margin-right: 30px;
          float: right;
        "
        clearable
      />
    </div>

    <!--整个页面 -->
    <!-- //justify-content主轴对齐方式 -->
    <div
      style="
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
      "
    >
      <!-- v-show="book.name == toSearch" -->

      <!-- 标题和内容区 -->
      <el-table
        :default-sort="{ prop: 'title', order: 'ascending' }"
        :data="
          books
            .filter(
              (tuple) =>
                this.toSearch == '' || // 搜索框为空，即不搜索
                tuple.title.includes(this.toSearch) || // 图书名与搜索要求一致
                tuple.author.includes(this.toSearch) || // 借出时间包含搜索要求
                tuple.press.includes(this.toSearch) // 归还时间包含搜索要求
            )
            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
        "
        style="width: 100%"
        highlight-current-row
      >
        <el-table-column
          fixed
          prop="title"
          label="Title"
          width="300"
          sortable=""
        />
        <el-table-column
          prop="category"
          label="Category"
          width="200"
          sortable=""
        />
        <el-table-column prop="author" label="Author" width="250" sortable="" />
        <el-table-column prop="press" label="Press" width="200" sortable="" />
        <el-table-column prop="price" label="Price" width="200" sortable="" />
        <el-table-column prop="stock" label="Stock" width="200" sortable="" />
        <el-table-column
          prop="publishYear"
          label="PublishYear"
          width="200"
          sortable=""
        />
        <el-table-column fixed="right" label="Operations" width="400">
          <template #default="scope">
            <el-button
              link
              type="primary"
              size="large"
              @click="
                (borrowVisible = true),
                  (borrowBookId = scope.row.bookId),
                  (borrowBookTitle = scope.row.title)
              "
              >Borrow</el-button
            >
            <el-button
              link
              type="success"
              size="large"
              @click="
                (incBookVisible = true),
                  (toIncTitle = scope.row.title),
                  (incBookId = scope.row.bookId)
              "
              >Increase</el-button
            >
            <el-button
              link
              type="warning"
              size="large"
              @click="
                (modifyBookVisible = true),
                  (toModifyInfo.bookId = scope.row.bookId),
                  (toModifyInfo.title = scope.row.title),
                  (toModifyInfo.category = scope.row.category),
                  (toModifyInfo.author = scope.row.author),
                  (toModifyInfo.press = scope.row.press),
                  (toModifyInfo.price = scope.row.price),
                  (toModifyInfo.stock = scope.row.stock)
              "
              >Edit</el-button
            >
            <el-button
              link
              type="danger"
              size="large"
              @click="
                (removeBookVisible = true),
                  (toRemove = scope.row.bookId),
                  (toRemoveTitle = scope.row.title)
              "
              >Remove</el-button
            >
            <el-button
              link
              type="success"
              size="large"
              @click="
                (returnVisible = true),
                  (returnBookId = scope.row.bookId),
                  (returnBookTitle = scope.row.title)
              "
              >Return</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 新增按钮 -->
      <div style="display: flex; flex-direction: row-reverse; width: 100%">
        <div
          style="
            margin-left: 20px;
            margin-right: 20px;
            margin-top: 10px;
            font-weight: bold;
            font-size: medium;
          "
        >
          文件批量导入:
          <el-button
            class="newBookBox"
            type="primary"
            @click="(multiNewBookVisible = true), (this.multiNewBookUrl = '')"
          >
            <el-icon style="height: 25px; width: 100%"
              ><Folder style="height: 100%; width: 100%"
            /></el-icon>
          </el-button>
        </div>

        <div
          style="
            margin-left: 20px;
            margin-right: 20px;
            margin-top: 10px;
            font-weight: bold;
            font-size: medium;
          "
        >
          新增书籍:
          <el-button
            type="primary"
            @click="
              (newBookInfo.title = ''),
                (newBookInfo.category = ''),
                (newBookInfo.press = ''),
                (newBookInfo.publisherYear = 1974),
                (newBookInfo.author = ''),
                (newBookInfo.price = 0),
                (newBookInfo.stock = 0),
                (newBookVisible = true)
            "
          >
            <el-icon style="height: 25px; width: 100%">
              <Plus style="height: 100%; width: 100%" />
            </el-icon>
          </el-button>
        </div>
      </div>

      <!-- 新增页面 -->
      <div>
        <!-- 新建书证对话框 -->
        <el-dialog v-model="newBookVisible" title="新增书籍" width="30%">
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            书名：
            <el-input
              v-model="newBookInfo.title"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            类别：
            <el-input
              v-model="newBookInfo.category"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版商：
            <el-input
              v-model="newBookInfo.press"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版日期：
            <el-input
              v-model="newBookInfo.publisherYear"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            作者：
            <el-input
              v-model="newBookInfo.author"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            价格：
            <el-input
              v-model="newBookInfo.price"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            库存：
            <el-input
              v-model="newBookInfo.stock"
              style="width: 12.5vw"
              clearable
            />
          </div>

          <template #footer>
            <span>
              <el-button @click="newBookVisible = false">取消</el-button>
              <el-button
                type="primary"
                @click="ConfirmNewBook"
                :disabled="
                  newBookInfo.title.length === 0 ||
                  newBookInfo.category.length === 0 ||
                  newBookInfo.author.length === 0 ||
                  newBookInfo.press.length === 0 ||
                  newBookInfo.publisherYear === 0
                "
                >确定</el-button
              >
            </span>
          </template>
        </el-dialog>

        <!-- 修改书籍 -->
        <el-dialog
          v-model="modifyBookVisible"
          :title="'修改信息(书籍ID: ' + this.toModifyInfo.bookId + ')'"
          width="30%"
        >
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            书名：
            <el-input
              v-model="toModifyInfo.title"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            类别：
            <el-input
              v-model="toModifyInfo.category"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版商：
            <el-input
              v-model="toModifyInfo.press"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版日期：
            <el-input
              v-model="toModifyInfo.publisherYear"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            作者：
            <el-input
              v-model="toModifyInfo.author"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            价格：
            <el-input
              v-model="toModifyInfo.price"
              style="width: 12.5vw"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            库存：
            <el-input
              v-model="toModifyInfo.stock"
              style="width: 12.5vw"
              clearable
            />
          </div>

          <template #footer>
            <span>
              <el-button @click="modifyBookVisible = false">取消</el-button>
              <el-button
                type="primary"
                @click="ConfirmModifyBook"
                :disabled="
                  toModifyInfo.title.length === 0 ||
                  toModifyInfo.category.length === 0 ||
                  toModifyInfo.author.length === 0 ||
                  toModifyInfo.press.length === 0 ||
                  toModifyInfo.publisherYear === 0
                "
                >确定</el-button
              >
            </span>
          </template>
        </el-dialog>

        <!-- 删除书籍 -->
        <el-dialog v-model="removeBookVisible" title="删除图书" width="30%">
          <span
            >确定删除图书：<span style="font-weight: bold"
              >"{{ toRemoveTitle }}"</span
            >吗？</span
          >

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="removeBookVisible = false">取消</el-button>
              <el-button type="danger" @click="ConfirmRemoveBook">
                删除
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 库存改变 -->
        <el-dialog v-model="incBookVisible" title="修改库存" width="30%">
          <span
            >改变图书：<span style="font-weight: bold">"{{ toIncTitle }}"</span
            >的库存</span
          >

          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            新增量（可以为负）：
            <el-input v-model="incBookNum" style="width: 12.5vw" clearable />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="incBookVisible = false">取消</el-button>
              <el-button type="primary" @click="ConfirmIncBook">
                确定
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 图书借阅 -->
        <el-dialog v-model="borrowVisible" title="图书借阅" width="30%">
          <span
            >借阅图书：<span style="font-weight: bold"
              >"{{ borrowBookTitle }}"</span
            >并填写相关信息</span
          >

          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            您的借书证ID:
            <el-input v-model="borrowCardId" style="width: 12.5vw" clearable />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="borrowVisible = false">取消</el-button>
              <el-button type="primary" @click="ConfirmBorrowBook">
                确定
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 图书归还 -->
        <el-dialog v-model="returnVisible" title="归还图书" width="30%">
          <span
            >归还图书：<span style="font-weight: bold"
              >"{{ returnBookTitle }}"</span
            >并填写相关信息</span
          >

          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            您的借书证ID:
            <el-input v-model="returnCardId" style="width: 12.5vw" clearable />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="returnVisible = false">取消</el-button>
              <el-button type="primary" @click="ConfirmReturnBook">
                确定
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 批量导入 -->
        <el-dialog v-model="multiNewBookVisible" title="批量导入" width="30%">
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            本地文件路径:
            <el-input
              v-model="multiNewBookUrl"
              style="width: 12.5vw"
              clearable
            />
          </div>

          <template #footer>
            <span class="dialog-footer">
              <el-button @click="multiNewBookVisible = false">取消</el-button>
              <el-button type="primary" @click="ConfirmMultiBook">
                确定
              </el-button>
            </span>
          </template>
        </el-dialog>

        <!-- 精确搜索 -->
        <el-dialog
          v-model="searchVisible"
          title="查询条件"
          width="40%"
          align-center
        >
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            类别：
            <el-input
              v-model="toSearchInfo.category"
              style="position: relative; left: 40px; width: 70%"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            书名：
            <el-input
              v-model="toSearchInfo.title"
              style="position: relative; left: 40px; width: 70%"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版社：
            <el-input
              v-model="toSearchInfo.press"
              style="position: relative; left: 24.5px; width: 70%"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            出版年份：
            <el-input
              v-model="toSearchInfo.minPublisherYear"
              style="position: relative; left: 8px; width: 31.75%"
              clearable
            />
            <span
              style="
                position: relative;
                left: 9px;
                font-weight: bold;
                font-size: 1rem;
              "
              >——</span
            >
            <el-input
              v-model="toSearchInfo.maxPublisherYear"
              style="position: relative; left: 10px; width: 31.75%"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            作者：
            <el-input
              v-model="toSearchInfo.author"
              style="position: relative; left: 40px; width: 70%"
              clearable
            />
          </div>
          <div
            style="
              margin-left: 2vw;
              font-weight: bold;
              font-size: 1rem;
              margin-top: 20px;
            "
          >
            价格：
            <el-input
              v-model="toSearchInfo.minPrice"
              style="position: relative; left: 40px; width: 31.75%"
              clearable
            />
            <span
              style="
                position: relative;
                left: 41px;
                font-weight: bold;
                font-size: 1rem;
              "
              >——</span
            >
            <el-input
              v-model="toSearchInfo.maxPrice"
              style="position: relative; left: 42px; width: 31.75%"
              clearable
            />
          </div>
          <!-- <div >排序：
                    <el-select v-model="toSearchInfo.sortBy" size="middle" style="position: relative; left: 40px; width: 31.75%">
                    <el-option v-for="type in sortType" :key="type.value" :label="type.label" :value="type.value" />
                    </el-select>
                    <el-select v-model="toSearchInfo.sortOrder" size="middle" style="position: relative; left: 74px; width: 31.75%">
                    <el-option v-for="type in orderType" :key="type.value" :label="type.label" :value="type.value" />
                    </el-select>
                </div> -->

          <template #footer>
            <span>
              <el-button @click="searchVisible = false">取消</el-button>
              <el-button type="primary" @click="ConfirmSearchBook"
                >确定</el-button
              >
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
    <!-- 新建书本 -->
  </el-scrollbar>
</template>

<script>
import { useRouter } from "vue-router";
import { Plus, Search } from "@element-plus/icons-vue";
import axios from "axios";
import { ElMessage } from "element-plus";
import { sortOrders } from "element-plus/es/components/table-v2/src/constants";

export default {
  data() {
    return {
      totallist: 0,
      pageSize: 15,
      currentPage: 1,
      router: useRouter(),
      books: [
        {
          bookId: 1,
          category: "Novel",
          title: "Fuck",
          press: "Press-F",
          publisherYear: 1974,
          author: "WenHao",
          price: 666.0,
          stock: 50,
        },
        {
          bookId: 2,
          category: "Novel",
          title: "Shit",
          press: "Press-S",
          publisherYear: 1974,
          author: "WenHao",
          price: 111.0,
          stock: 50,
        },
      ],
      toSearch: "", // 搜索内容
      Search,
      newBookVisible: false, // 新建对话框可见性
      removeBookVisible: false, // 删除对话框可见性
      toRemove: 0, // 待删除书号
      toRemoveTitle: "", // 待删除书
      incBookId: 0,
      incBookNum: 0,
      toIncTitle: 0,
      incBookVisible: false,
      borrowBookId: 0,
      borrowTime: 0,
      borrowBookTitle: "",
      borrowCardId: 0,
      borrowVisible: false,
      returnBookId: 0,
      returnBookTitle: "",
      returnCardId: 0,
      returnVisible: false,
      multiNewBookVisible: false,
      multiNewBookUrl: "",
      searchVisible: false,
      newBookInfo: {
        // 待新建书信息
        category: "",
        title: "在1974年,我第一次在东南亚",
        press: "",
        publisherYear: 1974,
        author: "",
        price: 0,
        stock: 0,
      },
      modifyBookVisible: false, // 修改信息对话框可见性
      toModifyInfo: {
        // 待修改书信息
        bookId: 0,
        category: "",
        title: "在1974年,我第一次在东南亚",
        press: "",
        publisherYear: 1974,
        author: "",
        price: 0,
        stock: 0,
      },
      toSearchInfo: {
        // 查询书籍信息
        category: "",
        title: "",
        press: "",
        minPublisherYear: 0,
        maxPublisherYear: 2025,
        author: "",
        minPrice: 0,
        maxPrice: 10000,
        sortBy: "",
        sortOrder: "",
        stock: 0,
      },
      sortType: ["升序", "降序"],
      orderType: [
        "book_id",
        "category",
        "title",
        "press",
        "publish_year",
        "author",
        "price",
        "stock",
      ],
      tableData: [
        {
          // 列表项
          cardId: 1,
          bookId: 1,
          borrowTime: "2024.03.04 21:48",
          returnTime: "2024.03.04 21:49",
        },
      ],
    };
  },
  methods: {
    async QueryBooks() {
      let response = await axios.get("/book"); // 向/book发出GET请求s
      this.books = []; // 清空列表
      let books = response.data; // 接收响应负载
      books.forEach((book) => {
        this.books.push(book);
      });
      console.log(books);
    },
    async ConfirmNewBook() {
      await axios
        .post("/book", {
          category: this.newBookInfo.category,
          title: this.newBookInfo.title,
          press: this.newBookInfo.press,
          publishYear: this.newBookInfo.publisherYear,
          author: this.newBookInfo.author,
          price: this.newBookInfo.price,
          stock: this.newBookInfo.stock,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("新增图书成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.newBookVisible = false; // 将对话框设置为不可见
          this.QueryBooks(); // 重新查询借书证以刷新页面
        });
    },
    async ConfirmModifyBook() {
      await axios
        .post("/book", {
          id: this.toModifyInfo.bookId,
          category: this.toModifyInfo.category,
          title: this.toModifyInfo.title,
          press: this.toModifyInfo.press,
          publishYear: this.toModifyInfo.publisherYear,
          author: this.toModifyInfo.author,
          price: this.toModifyInfo.price,
          stock: this.toModifyInfo.stock,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("图书信息修改成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.modifyBookVisible = false; // 将对话框设置为不可见
          this.QueryBooks(); // 重新查询书以刷新页面
        });
    },
    async ConfirmRemoveBook() {
      await axios
        .post("/book", {
          id: this.toRemove,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("图书删除成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.removeBookVisible = false; // 将对话框设置为不可见
          this.QueryBooks(); // 重新查询借书证以刷新页面
        });
    },
    async ConfirmIncBook() {
      await axios
        .post("/book", {
          incBookId: this.incBookId,
          incBookNum: this.incBookNum,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("图书库存修改成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.incBookVisible = false; // 将对话框设置为不可见
          console.log(response);
          this.QueryBooks(); // 重新查询借书证以刷新页面
        });
    },
    async ConfirmBorrowBook() {
      await axios
        .post("/book", {
          flag_of_borrow: true,
          borrowBookId: this.borrowBookId,
          borrowCardId: this.borrowCardId,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("图书借阅成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.borrowVisible = false; // 将对话框设置为不可见
          this.QueryBooks(); // 重新查询借书证以刷新页面
        });
    },
    async ConfirmReturnBook() {
      this.tableData = []; // 清空列表
      // console.log(this.returnCardId);
      console.log("所还书：", this.returnBookId);
      let response = await axios.get("/borrow", {
        params: { cardID: this.returnCardId },
      }); // 向/borrow发出GET请求，参数为cardID=this.toQuery
      // console.log("之前借书的信息",response);
      let borrows = response.data; // 获取响应负载
      // console.log("QueryBorrows:",borrows);
      borrows.forEach((borrow) => {
        // 对于每一个借书记录
        this.tableData.push(borrow); // 将它加入到列表项中
        if (borrow.bookId == this.returnBookId && borrow.returnTime == 0) {
          this.borrowTime = borrow.borrowTime;
        }
      });
      console.log(this.borrowTime);
      if (this.borrowTime == 0) {
        ElMessage.error(
          `当前cardId:${this.borrowCardId}并未借阅图书:${this.returnBookTitle}`
        );
        console.log("table:", this.tableData);
      } else {
        await axios
          .post("/book", {
            flag_of_return: true,
            borrowTime: this.borrowTime,
            returnBookId: this.returnBookId,
            returnCardId: this.returnCardId,
          })
          .then((response) => {
            if (response.data === "success") {
              ElMessage.success("图书归还成功"); // 显示消息提醒
            } else {
              ElMessage.error(response.data);
            }
            this.returnVisible = false; // 将对话框设置为不可见
            this.QueryBooks(); // 重新查询借书证以刷新页面
          });
      }
    },
    async ConfirmMultiBook() {
      await axios
        .post("/book", {
          multiNewBookUrl: this.multiNewBookUrl,
        })
        .then((response) => {
          if (response.data === "success") {
            ElMessage.success("图书导入成功"); // 显示消息提醒
          } else {
            ElMessage.error(response.data);
          }
          this.multiNewBookVisible = false; // 将对话框设置为不可见
          console.log(response);
          this.QueryBooks(); // 重新查询借书证以刷新页面
        });
    },
    async ConfirmSearchBook() {
      await axios
        .post("/book", {
          category: this.toSearchInfo.category,
          title: this.toSearchInfo.title,
          press: this.toSearchInfo.press,
          minPublisherYear: this.toSearchInfo.minPublisherYear,
          maxPublisherYear: this.toSearchInfo.maxPublisherYear,
          author: this.toSearchInfo.author,
          minPrice: this.toSearchInfo.minPrice,
          maxPrice: this.toSearchInfo.maxPrice,
          sortBy: this.toSearchInfo.sortBy,
          sortOrders: this.toSearchInfo.sortOrder,
          stock: this.toSearchInfo.stock,
        })
        .then((response) => {
          ElMessage.success("图书搜索成功");
          this.books = []; // 清空列表
          let books = response.data; // 接收响应负载
          books.forEach((book) => {
            this.books.push(book);
          });
          this.searchVisible = false; // 将对话框设置为不可见
          console.log(response);
          // this.QueryBooks() // 重新查询借书证以刷新页面
        });
    },
  },
  mounted() {
    // 当页面被渲染时
    // console.log("首次开始获取数据");
    this.QueryBooks(); // 查询借书证
  },
  computed: {
    getTotalList() {
      return this.books.filter(
        (tuple) =>
          this.toSearch == "" || // 搜索框为空，即不搜索
          tuple.title.includes(this.toSearch) || // 图书名与搜索要求一致
          tuple.author.includes(this.toSearch) || // 借出时间包含搜索要求
          tuple.press.includes(this.toSearch) // 归还时间包含搜索要求
      ).length;
    },
  },
};
</script>

<style scoped>
.example-pagination-block {
  margin-top: 10px;
}
.example-pagination-block {
  margin-bottom: 16px;
}

.Fuck div {
  margin-left: 2vw;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 20px;
}
</style>