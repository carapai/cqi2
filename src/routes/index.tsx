import { createFileRoute } from "@tanstack/react-router";
import ReactECharts from "echarts-for-react";
import { Typography } from "antd";
import { dashboardQueryOptions } from "@/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

const { Title } = Typography;

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(dashboardQueryOptions()),
  pendingComponent: () => <div>Loading...</div>,
});

function Home() {
  //   const { indicators } = useLoaderData({ from: "__root__" });
  const { data } = useSuspenseQuery(dashboardQueryOptions());

  const teiData = data.filter((item) => item.tei);

  const completedProjects = data.filter(
    (item) => item.eZrfD4QnQfl !== ""
  ).length;
  const runningProjects = data.filter((item) => item.eZrfD4QnQfl === "").length;

  const chartOptions = {
    title: {
      text: "Project Status Overview",
    },
    grid: {
      left: "10%",
      right: "10%",
      bottom: "10%",
      containLabel: true,
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}",
    },
    xAxis: {
      type: "category",
      data: ["Total Projects", "Completed Projects", "Running Projects"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Total Projects",
        data: [teiData.length, completedProjects, runningProjects],
        type: "bar",
        itemStyle: {
          color: function (params: { dataIndex: number }) {
            const colors = ["#5470C6", "#91CC75", "#EE6666"];
            return colors[params.dataIndex];
          },
        },
      },
    ],
  };

  // Different chart types
  const pieChartOptions = {
    ...chartOptions,
    series: [{ ...chartOptions.series[0], type: "pie" }],
  };

  const lineChartOptions = {
    ...chartOptions,
    series: [{ ...chartOptions.series[0], type: "line" }],
  };

  const scatterChartOptions = {
    ...chartOptions,
    series: [{ ...chartOptions.series[0], type: "scatter" }],
  };

  const radarChartOptions = {
    radar: {
      indicator: [
        { name: "Total Projects" },
        { name: "Completed Projects" },
        { name: "Running Projects" },
      ],
    },
    series: [
      {
        data: [{ value: [teiData.length, completedProjects, runningProjects] }],
        type: "radar",
      },
    ],
  };

  const polarChartOptions = {
    angleAxis: {},
    radiusAxis: {},
    polar: {},
    series: [
      { ...chartOptions.series[0], type: "bar", coordinateSystem: "polar" },
    ],
  };

  return (
    <div className="dashboard-container">
      <Title level={4}>Dashboard Overview</Title>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
        }}
      >
        <ReactECharts option={chartOptions} />
        <ReactECharts option={pieChartOptions} />
        <ReactECharts option={lineChartOptions} />
        <ReactECharts option={scatterChartOptions} />
        <ReactECharts option={radarChartOptions} />
        <ReactECharts option={polarChartOptions} />
      </div>
    </div>
  );
}

export default Home;
