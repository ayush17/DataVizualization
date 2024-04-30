let dom = document.getElementById("line-chart-container");
let myChart = echarts.init(dom, null, {
  renderer: "canvas",
  useDirtyRect: false,
});

// Function to fetch string data from file and convert it to array
function fetchDataAndConvertToArray() {
  return fetch("./killed_by_country.csv")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      return response.text(); // Get the text content of the response
    })
    .then((textData) => {
      // Split the text into an array using a delimiter (e.g., newline '\n')
      const dataArray = textData.split("\n");
      return dataArray;
    });
}

// Use fetchDataAndConvertToArray() with .then() to handle the asynchronous result
fetchDataAndConvertToArray()
  .then((dataArray) => {
    console.log(dataArray); // Log the array after it's been fetched and converted
    run(dataArray);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

function run(rawData) {
  let _rawData = [];
  rawData.forEach((element) => {
    let temp = element.split(",");
    _rawData.push(temp);
    return element;
  });

  // Get the top 10 country names here
  const countries = [
    "Iraq",
    "Nigeria",
    "Afghanistan",
    "Syria",
    "United States",
    "Pakistan",
    "Somalia",
  ];
  const datasetWithFilters = [];
  const seriesList = [];
  echarts.util.each(countries, function (country) {
    var datasetId = "dataset_" + country;

    datasetWithFilters.push({
      id: datasetId,
      fromDatasetId: "dataset_raw",
      transform: {
        type: "filter",
        config: {
          and: [
            { dimension: "year", gte: 2000 },
            { dimension: "country", "=": country },
          ],
        },
      },
    });

    seriesList.push({
      type: "line",
      datasetId: datasetId,
      showSymbol: false,
      name: country,
      endLabel: {
        show: true,
        formatter: function (params) {
          console.log(params);
          return params.value[1] + ": " + params.value[3];
        },
      },
      labelLayout: {
        moveOverlap: "shiftY",
      },
      emphasis: {
        focus: "series",
      },
      encode: {
        x: "year",
        y: "nkilled",
        label: ["country", "nkilled"],
        itemName: "year",
        tooltip: ["nkilled"],
      },
    });
  });
  option = {
    animationDuration: 10000,
    dataset: [
      {
        id: "dataset_raw",
        source: _rawData,
      },
      ...datasetWithFilters,
    ],
    title: {
      text: "Number of killings in some top countries by terrorist",
    },
    tooltip: {
      order: "valueDesc",
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      nameLocation: "middle",
    },
    yAxis: {
      name: "nkilled",
    },
    grid: {
      right: 140,
    },
    series: seriesList,
  };

  // Set chart option
  // myChart.setOption(option);

  // var button = document.createElement("button");
  // button.textContent = "Animate Chart";
  // button.setAttribute("id", "animate-chart-button"); // Set id attribute
  // // Apply CSS styles directly to the button element
  // // button.style.position = "absolute";
  // button.style.padding = "10px 20px";
  // button.style.backgroundColor = "#007bff";
  // button.style.color = "#fff";
  // button.style.border = "none";
  // button.style.borderRadius = "5px";
  // button.style.cursor = "pointer";
  // // Append the button to the chart container
  // dom.appendChild(button);

  // Event listener for the button
  document
    .getElementById("animate-chart-button")
    .addEventListener("click", function () {
      myChart.setOption(option);
    });
}

window.addEventListener("resize", function () {
  if (myChart) {
    myChart.resize();
  }
});
