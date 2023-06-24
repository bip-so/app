import type { NextPage } from "next";
import { BipPage } from "../src/commons/types";

const ProtectedPage: BipPage = () => {
  return <div className="text-2xl font-bold">Protected Page</div>;
};

ProtectedPage.auth = true;
export default ProtectedPage;
