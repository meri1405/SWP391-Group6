import React from "react";
import { Layout, Breadcrumb } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import { RestockRequestList } from "../components/dashboard/admin/inventory";

const { Content } = Layout;

const RestockRequestListPage = () => {
  return (
    <Layout className="site-layout" style={{ minHeight: "100vh" }}>
      <Content style={{ margin: "0 16px" }}>
        <Breadcrumb style={{ margin: "16px 0" }}>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>Quản lý vật tư y tế</Breadcrumb.Item>
          <Breadcrumb.Item>Danh sách yêu cầu bổ sung</Breadcrumb.Item>
        </Breadcrumb>
        <div
          className="site-layout-background"
          style={{ padding: 24, minHeight: 360 }}
        >
          <RestockRequestList />
        </div>
      </Content>
    </Layout>
  );
};

export default RestockRequestListPage;
