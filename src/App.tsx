import "./App.css";
import { bitable, INumberField, IOpenSegmentType, ITextField } from "@lark-base-open/js-sdk";
import { uploadJSON } from "./utils/upload";
import { createClient } from "./utils/oss";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type RecordContentType = {
  dir: string;
  text: string;
  lang_zh: string;
  team: string;
};
type BaseResponse<DataType = unknown> = {
  code: number;
  msg: string | null;
  data: DataType | null;
};

export default function App() {
  const fileName = "templates_group_tabs.json";
  const process = async () => {
    // Get the current selection
    const selection = await bitable.base.getSelection();
    console.log("selection: ", selection);
    // Find current table by tableId
    const table = await bitable.base.getTableById(selection?.tableId!);
    console.log("table: ", table);

    // Get table's field meta list
    const fieldMetaList = await table.getFieldMetaList();
    console.log("fieldMetaList: ", fieldMetaList);
    // Find the field with the same name as Multiline or 多行文本
    const indexFieldMeta = fieldMetaList.filter((item) => item.isPrimary)[0];
    const textFields = fieldMetaList.filter(({ type }) => type === 1);
    const nameFieldMeta = textFields.find((field) => field.name.includes("name"));
    const searchWordFieldMeta = textFields.find((field) => field.name.includes("searchWord"));

    if (!nameFieldMeta || !indexFieldMeta || !searchWordFieldMeta) return;
    const indexField = await table.getField<INumberField>(indexFieldMeta.id);
    const nameField = await table.getField<ITextField>(nameFieldMeta.id);
    const searchWordField = await table.getField<ITextField>(searchWordFieldMeta.id);
    if (!nameField || !indexField || !searchWordField) return;

    const recordIdList = await table.getRecordIdList();
    let indexRecordList = [];
    for (let i = 0; i < recordIdList.length; i++) {
      const indexCellValue = await indexField.getValue(recordIdList[i]);
      indexRecordList.push({
        index: indexCellValue,
        recordId: recordIdList[i],
      });
    }
    const sortedRecordList = indexRecordList
      .filter((value) => typeof value.index === "number")
      .sort((a, b) => a.index - b.index);
    console.log("sortedRecordList: ", sortedRecordList);

    const tabsData = [];
    for (let i = 0; i < sortedRecordList.length; i++) {
      const { recordId } = sortedRecordList[i];
      const nameItem = await nameField.getCellString(recordId);
      const searchWordItem = await searchWordField.getCellString(recordId);
      if (nameItem && searchWordItem) {
        tabsData[i] = {
          name: nameItem,
          searchWord: searchWordItem,
        };
      }
    }

    const json = { tabsData };
    const jsonString = JSON.stringify(json);

    const ossPath = "/custom/ecoverse/";

    const { client: ossClient } = await createClient();

    uploadJSON(jsonString, ossClient, fileName, ossPath)
    .then((res) => {
      console.log("uploaded", res);

      if (res.url && res.res.status === 200) {
        toast.success("上传成功");
      } else {
        toast.error("上传遇到问题，请重试");
      }
    });
  };

  // function download(context: Blob, name: string) {
  //   const a = document.createElement("a");
  //   a.setAttribute("download", name);
  //   let url = URL.createObjectURL(context);
  //   a.href = url;
  //   a.click();
  //   a.remove();
  //   setTimeout(() => {
  //     URL.revokeObjectURL(url);
  //   }, 1000);
  // }

  return (
    <main>
      <span className="tip">点击上传配置将覆盖线上模板 tab 顺序</span>
      <button className="export-btn" onClick={process}>
        上传配置
      </button>
    </main>
  );
}
