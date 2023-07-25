import React, { useEffect, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import {
  Radio,
  Space,
  Table,
  Button,
  Spin,
  Select,
  Form,
  Typography,
  Progress,
  message,
} from "antd";
import axios from "axios";

import GoogleMapTool from "./GoogleMapTool";
import cityListJson from "../data/cityList.json";

function HomePage() {
  const keyValue = "ddc25a8b210ab01bba26befd30c70b9d";
  const lang = `zh_tw`; //語言

  const [cityNameForm] = Form.useForm();

  const [cityData, setCityData] = useState([]);
  const [cityNameList, setCityNameList] = useState(
    localStorage.getItem("cityList")
      ? localStorage.getItem("cityList").split(",")
      : []
  );
  const [units, setUnits] = useState(`metric`);
  const [loading, setLoading] = useState(false);
  const [panToCenter, setPanToCenter] = useState({
    lat: 25.0478,
    lng: 121.5319,
  });

  useEffect(() => {
    getListData();
  }, [units]);

  useEffect(() => {
    if (cityNameList.length) {
      getListData();
      localStorage.setItem("cityList", cityNameList);
    } else {
      localStorage.clear();
    }
  }, [cityNameList]);

  const onSearch = (value) => {
    if (!value.selectedCity) {
      return message.error("請選擇城市");
    }
    setLoading(true);

    const upperInputValue = value.selectedCity.toUpperCase();
    // 重新排序搜尋結果
    if (cityNameList.includes(upperInputValue)) {
      let tempCityList = cityNameList.filter(
        (city) => city !== upperInputValue
      );
      setCityNameList([upperInputValue, ...tempCityList]);
    }
    // 如果本來的結果沒有該城市 直接在既有的array中加入搜尋的城市
    else {
      setCityNameList((prev) => [...prev, upperInputValue]);
    }
    cityNameForm.resetFields();

    setLoading(false);
  };

  const getListData = async () => {
    if (!cityNameList[0]) {
      return;
    }
    setLoading(true);
    let tempData = [];
    const getWeatherData = async () => {
      for (let i = 0; i < cityNameList.length; i++) {
        await axios({
          url: "https://api.openweathermap.org/data/2.5/weather",
          params: {
            q: cityNameList[i],
            appid: keyValue,
            lang,
            units,
          },
        }).then((data) => {
          tempData.push(data.data);
        });
      }
    };
    await getWeatherData();
    setCityData(tempData);
    setLoading(false);
  };

  const allDelete = () => {
    setCityData([]);
    setCityNameList([]);
  };

  const columns = [
    {
      title: "城市",
      dataIndex: "name",
      key: "name",
      render: (text, record) => {
        return (
          <Space
            size="small"
            onClick={() => {
              setPanToCenter({ lat: record.coord.lat, lng: record.coord.lon });
            }}
          >
            <a>{text}</a>
          </Space>
        );
      },
    },
    {
      title: "天氣狀況",
      dataIndex: ["weather", "0", "description"],
      key: "description",
    },
    {
      title: "當前溫度",
      dataIndex: ["main", "temp"],
      key: "temp",
    },
    {
      title: "最高溫度",
      dataIndex: ["main", "temp_max"],
      key: "temp_max",
    },
    {
      title: "最低溫度",
      dataIndex: ["main", "temp_min"],
      key: "temp_min",
    },
    {
      title: "濕度",
      dataIndex: ["main", "humidity"],
      key: "humidity",
      width: "20%",
      render: (dataIndex) => (
        <Progress percent={dataIndex} size="small">
          %
        </Progress>
      ),
    },
    {
      title: "刪除",
      dataIndex: "delete",
      key: "delete",
      render: (text, record, index) => {
        return (
          <Space
            size="small"
            onClick={() => {
              const newArr = cityData.filter((_, idx) => idx !== index);
              setCityData(newArr);
              setCityNameList((prev) =>
                prev.filter((city) => {
                  return city !== record.name.toUpperCase();
                })
              );
            }}
          >
            <a>刪除</a>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="homepage-main">
        <div className="homepage-left">
          <div className="homepage-header">
            <Typography.Title>
              <div className="homepage-header-title">Weather-App</div>
            </Typography.Title>
            <Space
              size={50}
              align={window.innerWidth < 767 && "start"}
              direction={window.innerWidth > 767 ? "horizontal" : "vertical"}
            >
              <div style={{ width: "50%" }}>
                <Form onFinish={onSearch} form={cityNameForm}>
                  <Form.Item name={"selectedCity"}>
                    <Select
                      showSearch
                      placeholder="請輸入城市的英文名稱"
                      optionFilterProp="children"
                      style={{ width: 300 }}
                    >
                      {cityListJson.map((list) => (
                        <Select.Option value={list.name} key={list.id}>
                          {list.name} (lat緯度{list.coord.lat} / lon經度
                          {list.coord.lon})
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <Button ghost htmlType="submit">
                    取得天氣資料
                  </Button>
                </Form>
              </div>
              <div className="homepage-content-unitChange">
                請選擇溫度單位
                <Radio.Group
                  defaultValue={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <Space direction="vertical">
                    <Radio
                      value={"metric"}
                      style={{ fontSize: 14, color: "white" }}
                    >
                      攝氏度（°C）
                    </Radio>
                    <Radio
                      value={"imperial"}
                      style={{ fontSize: 14, color: "white" }}
                    >
                      華氏度（°F）
                    </Radio>
                  </Space>
                </Radio.Group>
              </div>
            </Space>
          </div>
          <div className="homepage-content">
            <Table
              size="small"
              rowKey={"id"}
              columns={columns}
              dataSource={cityData}
              scroll={{ x: 600 }}
              pagination={{ defaultPageSize: 3 }}
            />
          </div>
          <div className="homepage-footer">
            <Space size={10}>
              <Button ghost onClick={() => getListData()}>
                重新整理
              </Button>
              <Button ghost onClick={allDelete}>
                全部刪除
              </Button>
              <div className="homepage-footer-status">
                {loading ? (
                  <Spin
                    indicator={
                      <LoadingOutlined
                        style={{
                          fontSize: 20,
                          color: "white",
                        }}
                        spin
                      />
                    }
                    spinning={loading}
                  />
                ) : (
                  `Done！`
                )}
              </div>
            </Space>
          </div>
        </div>
        <div className="homepage-right">
          <GoogleMapTool panToCenter={panToCenter} cityData={cityData} />
        </div>
      </div>
    </>
  );
}

export default HomePage;
