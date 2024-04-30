window.addEventListener("load", function () {
  const chart1 = document.getElementById("chart1");
  const chart2 = document.getElementById("chart2");
  const myChart1 = echarts.init(chart1);
  const myChart2 = echarts.init(chart2);

  fetch("/data/suicide_attack_sunburst.json")
    .then((response) => response.json())
    .then((data) => {
      let option = {
        visualMap: {
          type: "continuous",
          min: 0,
          max: 5000,
          inRange: {
            color: ["#2F93C8", "#AEC48F", "#FFDB5C", "#F98862"],
          },
        },
        series: {
          type: "sunburst",
          data: data,
          radius: [0, "90%"],
          label: {
            rotate: "radial",
            fontSize: 10,
          },
          levels: [],
        },
      };
      myChart1.setOption(option);

      // Set variables to null after usage
      chart1 = null;
      myChart1 = null;
      option = null;
    });

  fetch("/data/attack_type_sunburst.json")
    .then((response) => response.json())
    .then((data) => {
      let option = {
        visualMap: {
          type: "continuous",
          min: 0,
          max: 100000,
          inRange: {
            color: ["#2F93C8", "#AEC48F", "#FFDB5C", "#F98862"],
          },
        },
        series: {
          type: "sunburst",
          data: data,
          radius: [0, "90%"],
          label: {
            rotate: "radial",
            fontSize: 10,
          },
          levels: [],
        },
      };
      myChart2.setOption(option);

      // Set variables to null after usage
      chart2 = null;
      myChart2 = null;
      option = null;
    });
});
