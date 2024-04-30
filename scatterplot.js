function loadScatterplot() {
  ////////////////////////////////////////
  ////////// SVG and containers //////////
  ////////////////////////////////////////

  // Make svg size scalable
  var svgW = $("#scatterplot").width();
  var svgH = 0.5 * svgW;
  var margin = {
      left: 100,
      top: 100,
      right: 100,
      bottom: 100,
    },
    width = svgW - margin.left - margin.right,
    height = svgH - margin.top - margin.bottom;
  var padding = 15;

  // We must ensure circles don't overlap with axes
  var space = function (minValue, maxValue) {
    return 0.1 * (maxValue - minValue);
  };

  // Append new svg element to DOM
  // Append g to svg which acts as an area where circles are drawn
  // We need g to be subset of svg to make a bit space for x and y axis
  var svg = d3
    .select("#svg-scatterplot")
    .attr("width", svgW)
    .attr("height", svgH);
  svg.append("rect").attr("class", "svg-bg");
  var clip = svg
    .append("g") // New coordinate system (= clipPath)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //////////////////////////////////////
  ////////// Scatterplot data //////////
  //////////////////////////////////////

  var groupedData = d3
    .nest()
    .key(function (d) {
      return d.category;
    })
    .key(function (d) {
      return d.subcategory;
    })
    .key(function (d) {
      return d.type;
    })
    .object(this.data.scatterplotData);

  // Group data by role
  var roles = {
    Victims: ["Killed", "Wounded"],
    Terrorists: ["Terrorists Killed", "Terrorists Wounded"],
  };

  // Label data
  var metrics = {
    Attacks: "nattacks",
    Killed: "nkilled",
    Wounded: "nwounded",
    "Terrorists Killed": "nkilledter",
    "Terrorists Wounded": "nwoundedter",
  };

  // Set initial data
  var focusCategory = "World";
  var focusSubcategory = "All Regions";
  var focusType = "Weapon Type";
  var focusRole = "Victims";
  var relative = true;
  var focusDataset;

  function updateDataset() {
    focusDataset = groupedData[focusCategory][focusSubcategory][focusType];
  }

  updateDataset();

  var getSubtype = function (d) {
    return d.subtype;
  };

  // Needed to fetch all subtypes
  // If we get index of each subtype using focusDataset, index may vary
  var groupedByType = d3
    .nest()
    .key(function (d) {
      return d.type;
    })
    .object(this.data.scatterplotData);

  var getIndex = function (d) {
    return d3
      .map(groupedByType[focusType], getSubtype)
      .keys()
      .indexOf(getSubtype(d));
  };

  ////////////////////////////
  ////////// X Axis //////////
  ////////////////////////////

  // Define key function to maintain consistency between data and DOM
  var getX = function (d) {
    if (relative) {
      return (
        Math.round((d[metrics[roles[focusRole][0]]] / d.nattacks) * 100) / 100
      );
    }
    return d[metrics[roles[focusRole][0]]];
  };

  var xMin = d3.min(this.data.scatterplotData, getX);
  var xMax = d3.max(this.data.scatterplotData, getX);
  var xScale = d3
    .scaleLinear()
    .domain([xMin - space(xMin, xMax), xMax + space(xMin, xMax)])
    .rangeRound([0, width]);
  var xMap = function (d) {
    return xScale(getX(d));
  };
  var xAxis = d3.axisBottom(xScale).ticks(5).tickSize(10);

  // Append x-axis element
  clip
    .append("g")
    .classed("x axis", true)
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);
  // Append text to svg, not axis

  svg
    .append("text")
    .classed("x axis-label", true)
    .attr("transform", "translate(" + svgW / 2 + "," + (svgH - padding) + ")");

  // Dynamically update x label (relative vs. absolute)
  function updateXLabel() {
    if (relative) {
      svg.select(".x.axis-label").text("Avg(" + roles[focusRole][0] + ")");
    } else {
      svg.select(".x.axis-label").text(roles[focusRole][0]);
    }
  }

  updateXLabel();

  // Add the X gridlines
  var xGridAxis = d3
    .axisBottom(xScale)
    .ticks(5)
    .tickSize(-height)
    .tickFormat("");
  clip
    .append("g")
    .classed("x grid", true)
    .attr("transform", "translate(0," + height + ")")
    .call(xGridAxis);

  function updateX() {
    xMin = d3.min(focusDataset, getX);
    xMax = d3.max(focusDataset, getX);
    xScale.domain([xMin - space(xMin, xMax), xMax + space(xMin, xMax)]);

    // Apply new xScale with animation
    clip.selectAll(".x.axis").transition().duration(1000).call(xAxis);
    clip.selectAll(".x.grid").transition().duration(1000).call(xGridAxis);
  }

  ////////////////////////////
  ////////// Y Axis //////////
  ////////////////////////////

  var getY = function (d) {
    if (relative) {
      return (
        Math.round((d[metrics[roles[focusRole][1]]] / d.nattacks) * 100) / 100
      );
    }
    return d[metrics[roles[focusRole][1]]];
  };

  var yMin = d3.min(focusDataset, getY);
  var yMax = d3.max(focusDataset, getY);
  var yScale = d3
    .scaleLinear()
    .domain([yMin - space(yMin, yMax), yMax + space(yMin, yMax)])
    .rangeRound([height, 0]);
  var yMap = function (d) {
    return yScale(getY(d));
  };
  var yAxis = d3.axisLeft(yScale).ticks(5).tickSize(10);

  // Append y-axis element
  clip.append("g").classed("y axis", true).call(yAxis);
  svg
    .append("text")
    .classed("y axis-label", true)
    .attr("transform", "translate(" + padding + "," + svgH / 2 + ")rotate(-90)")
    .attr("dy", ".71em");

  // Dynamically update y label (relative vs. absolute)
  function updateYLabel() {
    if (relative) {
      svg.select(".y.axis-label").text("Avg(" + roles[focusRole][1] + ")");
    } else {
      svg.select(".y.axis-label").text(roles[focusRole][1]);
    }
  }

  updateYLabel();

  // // Add the Y gridlines
  var yGridAxis = d3.axisLeft(yScale).ticks(5).tickSize(-width).tickFormat("");
  clip.append("g").classed("y grid", true).call(yGridAxis);

  function updateY() {
    yMin = d3.min(focusDataset, getY);
    yMax = d3.max(focusDataset, getY);
    yScale.domain([yMin - space(yMin, yMax), yMax + space(yMin, yMax)]);

    // Apply new yScale with animation
    clip.selectAll(".y.axis").transition().duration(1000).call(yAxis);
    clip.selectAll(".y.grid").transition().duration(1000).call(yGridAxis);
  }

  ///////////////////////////////////
  ////////// Circle radius //////////
  ///////////////////////////////////

  var getZ = function (d) {
    return d.nattacks;
  };

  zMin = d3.min(focusDataset, getZ);
  zMax = d3.max(focusDataset, getZ);
  var zScale = d3.scaleSqrt().domain([zMin, zMax]).rangeRound([5, 30]);
  var zMap = function (d) {
    return zScale(getZ(d));
  };

  function updateZ() {
    zMin = d3.min(focusDataset, getZ);
    zMax = d3.max(focusDataset, getZ);

    zScale.domain([zMin, zMax]);
  }

  //////////////////////////////////
  ////////// Circle color //////////
  //////////////////////////////////

  var cScale = d3.scaleOrdinal(d3.schemeCategory20);
  var cMap = function (d) {
    return d3.color(cScale(getIndex(d)));
  };

  //////////////////////////////////
  ////////// Draw circles //////////
  //////////////////////////////////

  var circleOpacity = {
    // Opacity of fill and stroke if overall opacity is 1
    fill: 0.7,
    stroke: 1,
    // Overall opacity
    inactive: 0.7,
    active: 1,
  };

  // Update circles when user changes the category/role
  function updateCircles() {
    // EXIT old elements not present in new data.
    clip
      .selectAll("circle")
      .data(focusDataset, getIndex)
      .exit()
      .transition()
      .attr("opacity", 0)
      .remove();

    // ENTER new elements present in new data.
    clip
      .selectAll("circle")
      .data(focusDataset, getIndex)
      .enter()
      .append("circle")
      .on("mouseover", function (d) {
        d3.select(this).attr("opacity", circleOpacity.active);
        tip.show(d);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr("opacity", circleOpacity.inactive);
        tip.hide(d);
      });

    // UPDATE elements present in new data.
    clip
      .selectAll("circle")
      .data(focusDataset, getIndex)
      .sort(function (x, y) {
        // Put small circles on top to make them accessible for mouseover event
        return d3.descending(getZ(x), getZ(y));
      })
      .transition()
      .duration(1000)
      .ease(d3.easeCubic)
      .attr("cx", xMap)
      .attr("cy", yMap)
      .attr("r", zMap)
      .attr("fill", cMap)
      .attr("fill-opacity", circleOpacity.fill)
      .attr("stroke", cMap)
      .attr("stroke-width", 2)
      .attr("stroke-opacity", circleOpacity.stroke)
      .attr("opacity", circleOpacity.inactive);
  }

  updateCircles();

  /////////////////////////////
  ////////// Tooltip //////////
  /////////////////////////////

  var tip = d3
    .tip()
    .attr("class", "d3-tip")
    .direction("ne")
    .html(function (d) {
      return (
        "<span style='color:" +
        cMap(d).brighter(0.5) +
        "'>" +
        getSubtype(d) +
        "</span><br><br><hr>Attacks: " +
        getZ(d)
      );
    });
  svg.call(tip);

  ///////////////////////////
  ////////// Title //////////
  ///////////////////////////

  // Append title
  var title = svg
    .append("text")
    .classed("title", true)
    .attr("x", svgW / 2)
    .attr("y", margin.top / 2); // We'll set the title later from the dropdown

  function setTitle() {
    title.selectAll("*").remove();

    var tmp = document.createElement("text");
    tmp.innerHTML =
      "The Most Lethal Terrorist Attacks for <tspan style='font-style: italic;'>" +
      focusRole +
      "</tspan> by <tspan style='font-style: italic;'>" +
      focusType +
      "</tspan> (<tspan style='font-style: italic;'>" +
      focusSubcategory +
      "</tspan>)";
    var nodes = Array.prototype.slice.call(tmp.childNodes);
    nodes.forEach(function (node) {
      title
        .append("tspan")
        .attr("style", node.getAttribute && node.getAttribute("style"))
        .text(node.textContent);
    });
  }

  setTitle();

  ////////////////////////////
  ////////// Update //////////
  ////////////////////////////

  // This function gets called when user changes some category/subcategory/type
  function updateAll() {
    updateDataset();

    updateX();
    updateXLabel();

    updateY();
    updateYLabel();

    updateZ();
    updateCircles();

    setTitle();
  }

  //////////////////////////////////////////
  ////////// Subcategory dropdown //////////
  //////////////////////////////////////////

  // Options first cuz they're needed by category dropdown

  // Method which turns array of values into options for dropdown
  function toOptionsFormat(list, optgroup) {
    var options = [];
    for (var i = 0; i < list.length; i++) {
      options.push({
        value: list[i],
        name: list[i],
        class: optgroup,
      });
    }
    return options;
  }

  // Initialize dropdown using selectize.js
  var $select2 = $("#scatterplot-select-subcategory").selectize({
    options: toOptionsFormat(
      Object.keys(groupedData[focusCategory]).sort(),
      focusCategory
    ),
    optgroups: [
      {
        value: focusCategory,
        label: focusCategory,
      },
    ],
    optgroupField: "class",
    labelField: "name",
    searchField: ["name"],
    onChange: function (t) {
      if (t && t != focusSubcategory) {
        focusSubcategory = t;

        updateAll();
      }
    },
  });
  var selectize2 = $select2[0].selectize;
  selectize2.setValue(focusSubcategory);

  ///////////////////////////////////////
  ////////// Category dropdown //////////
  ///////////////////////////////////////

  // Initialize dropdown using selectize.js
  var $select1 = $("#scatterplot-select-category").selectize({
    options: toOptionsFormat(["World", "Region", "Country"], "Area"),
    optgroups: [
      {
        value: "Area",
        label: "Area",
      },
    ],
    optgroupField: "class",
    labelField: "name",
    searchField: ["name"],
    onChange: function (t) {
      if (t && t != focusCategory) {
        focusCategory = t;

        selectize2.clear();
        selectize2.clearOptions();
        selectize2.clearOptionGroups();

        selectize2.addOptionGroup(focusCategory, {
          value: focusCategory,
          label: focusCategory,
        });
        var subcategories = Object.keys(groupedData[focusCategory]).sort();
        selectize2.load(function (callback) {
          callback(toOptionsFormat(subcategories, focusCategory));
        });
        focusSubcategory = subcategories[0];
        selectize2.setValue(focusSubcategory);

        updateAll();
      }
    },
  });
  var selectize1 = $select1[0].selectize;
  selectize1.setValue(focusCategory);

  /////////////////////////////////////
  ////////// Option dropdown //////////
  /////////////////////////////////////

  // Initialize dropdown using selectize.js
  var $select3 = $("#scatterplot-select-type").selectize({
    options: toOptionsFormat(
      Object.keys(groupedData[focusCategory][focusSubcategory]).sort(),
      "Type"
    ),
    optgroups: [
      {
        value: "Type",
        label: "Type",
      },
    ],
    optgroupField: "class",
    labelField: "name",
    searchField: ["name"],
    onChange: function (t) {
      if (t && t != focusType) {
        focusType = t;

        updateAll();
      }
    },
  });
  var selectize3 = $select3[0].selectize;
  selectize3.setValue(focusType);

  ///////////////////////////////////
  ////////// Role dropdown //////////
  ///////////////////////////////////

  var $select4 = $("#scatterplot-select-role").selectize({
    options: toOptionsFormat(Object.keys(roles).sort(), "Role"),
    optgroups: [
      {
        value: "Role",
        label: "Role",
      },
    ],
    optgroupField: "class",
    labelField: "name",
    searchField: ["name"],
    onChange: function (t) {
      if (t && t != focusRole) {
        focusRole = t;

        updateAll();
      }
    },
  });
  var selectize4 = $select4[0].selectize;
  selectize4.setValue(focusRole);

  ////////////////////////////
  ////////// Switch //////////
  ////////////////////////////

  d3.select("#scatterplot-button-relative").on("click", function () {
    relative = true;

    updateAll();
  });
  d3.select("#scatterplot-button-absolute").on("click", function () {
    relative = false;

    updateAll();
  });
}

function loadData(callback) {
  d3.queue()
    .defer(d3.json, "/strings.json")
    .defer(d3.csv, "/scatterplot.csv")
    .await(function (error, stringsDict, scatterplotData) {
      if (error) throw error;

      scatterplotData.forEach(function (d, i) {
        d.nattacks = +d.nattacks;
        d.nkilled = +d.nkilled;
        d.nkilledter = +d.nkilledter;
        d.nwounded = +d.nwounded;
        d.nwoundedter = +d.nwoundedter;
        d.category = stringsDict[d.category];
        d.subcategory = stringsDict[d.subcategory];
        d.type = stringsDict[d.type];
        d.subtype = stringsDict[d.subtype];
      });

      window.data = {
        stringsDict: stringsDict,
        scatterplotData: scatterplotData,
      };

      callback();
    });
}
