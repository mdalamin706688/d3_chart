function renderChart (wrapper, curData) {
    if (!wrapper) {
      return
    }
    const { select: d3Select, range: d3Range, rgb: d3Rgb,
      scaleLinear: d3ScaleLinear, line: d3Line, curveLinear: d3CurveLinear,
      arc: d3Arc, interpolateHsl: d3InterpolateHsl, easeElastic: d3EaseElastic,
    } = d3

    const width = 500
    const height = 250
    const minValue = curData.minValue
    const maxValue = curData.maxValue
    const curValue = curData.curValue
    const curPrice = curData.curPrice

    const radius = height - 10
    const majorTicks = 8
    const DURATION = 1500
    const labelInset = 15
    const ringWidth = 60
    const ringInset = 20
    const minAngle = -90
    const maxAngle = 90
    const range = maxAngle - minAngle
    const arcColorFn = d3InterpolateHsl(d3Rgb('#f05757'),d3Rgb('#8abe6e'))
    const arrowColor = '#dae7f5'

    const arc = d3Arc()
      .innerRadius(radius - ringWidth - ringInset)
      .outerRadius(radius - ringInset)
      .startAngle((d, i) => {
        const ratio = d * i
        return deg2rad(minAngle + (ratio * range))
      })
      .endAngle((d, i) => {
        const ratio = d * (i + 1)
        return deg2rad(minAngle + (ratio * range))
      })

    const svgData = d3Select(wrapper).selectAll('svg').data(['dummy data'])
    const tickData = d3Range(majorTicks).map(() => 1/majorTicks)

    const svgEnter = svgData.enter().append('svg')
    svgEnter.attr('width', width)
    svgEnter.attr('height', height).style("overflow", "visible")
    const svgMerge = svgData.merge(svgEnter)

    const centerTx = centerTranslation(radius)
    // sections
    const arcsData = svgMerge.selectAll('g.arc').data(tickData)
    const arcsEnter = arcsData.enter()
      .append('g')
      .attr('class', 'arc')
      .attr('transform', centerTx)

    arcsEnter.append('path')
      .attr('fill', (d, i) => arcColorFn(d * (i + 1)))
      .attr('d', arc)

    arcsData.merge(arcsEnter)

    // labels on sections
    const scaleValue = d3ScaleLinear()
      .range([0, 1])
      .domain([minValue, maxValue])
    const ticks = scaleValue.ticks(majorTicks)

    const labelsData = svgMerge.selectAll('g.label').data([-10,-5,0,5,10])
    const labelsEnter = labelsData.enter()
      .append('g')
      .attr('class', 'label')
      .attr('transform', centerTx)

    labelsData.exit().remove()

    labelsEnter
      .append('text')
      .text(d => d)

    const labelsMerge = labelsData.merge(labelsEnter)

    labelsMerge.select('text')
      .text(d => d)
      // .transition()
      // .duration(DURATION)
      .attr('transform', (d) => {
        const ratio = scaleValue(d)
        const newAngle = minAngle + (ratio * range) -2
        return 'rotate(' + newAngle + ') translate(0,' + (labelInset - radius) + ')'
      })
      svgEnter.append("text").attr("x", -20).attr("y", 160).text("Bearish")
      svgEnter.append("text").attr("x", 215).attr("y", 100).text("Neutral")
      svgEnter.append("text").attr("x", 450).attr("y", 160).text("Bullish")
      svgMerge.append("text").attr("id", "val").attr("x", 220).attr("y", 140).text(curValue).style("font-weight", "bold").style("font-size", "20px")
      svgMerge.append("text").attr("id", "pri").attr("x", 210).attr("y", 200).text("$"+curPrice).style("font-weight", "bold").style("font-size", "24px")
    const pointerWidth = 10
    const pointerHeadLengthPercent = 0.9
    const pointerHeadLength = Math.round(radius * pointerHeadLengthPercent)
    const pointerTailLength = 5
    const lineData = [[pointerWidth / 2, 0],
      [0, -pointerHeadLength],
      [-(pointerWidth / 2), 0],
      [0, pointerTailLength],
      [pointerWidth / 2, 0]]

    const pointerLine = d3Line().curve(d3CurveLinear)
    const pointerData = svgMerge.selectAll('g.pointer').data([lineData])
    const pointerEnter = pointerData.enter()
      .append('g')
      .attr('class', 'pointer')
      .attr('transform', centerTx)

    pointerEnter.append('path')
      .attr('d', pointerLine)
      .attr('transform', 'rotate(' + minAngle + ')')
      .attr('fill', arrowColor)

    const pointerMerge = pointerData.merge(pointerEnter)
    const ratio = scaleValue(curValue)
    const newAngle = minAngle + (ratio * range)
    pointerMerge.select('path')
      .transition()
      .duration(DURATION)
      .ease(d3EaseElastic)
      .attr('transform', 'rotate(' + newAngle + ')')
  }

  function centerTranslation (r) {
    return 'translate(' + r + ',' + r + ')'
  }

  function deg2rad (deg) {
    return deg * Math.PI / 180
  }

  document.addEventListener('DOMContentLoaded', () => {
    const maxValue = 10
    const minValue = -10
    
    //Data Manipulation
    d3.csv("data.csv").then(function(data){
        console.log(data)
        var buttonNames = [];
        let i = 0;
        data.forEach(element => {
            buttonNames.push(element["date"]);
            element["score"] = +element["score"];
            element["num"] = i; 
            i +=1;
        });

          d3.select("#timeSelection")
          .selectAll("input")
          .data(buttonNames)
          .enter()
          .append("input")
          .attr("type","button")
          .attr("class", "button")
          .attr("id",function(d, i){
              return "button"+i;
          })
          .attr("value", function (d){return d;} )
          .on("click", function(d){
              d3.select("#val").remove()
              d3.select("#pri").remove()
              d3.selectAll(".button").style("background-color", "rgb(239, 239, 239)")
              let sel = d.toString();
              let fdata = data.filter(function(fd){ return fd.date==sel;})
              d3.select("#button"+fdata[0].num).style("background-color", "darkgrey")
              renderChart(document.querySelector('#wrapper'), {
                  minValue, curValue: fdata[0].score, curPrice: fdata[0].price, maxValue,
              })
          })
          d3.select("#button10").style("background-color", "darkgrey")
          renderChart(document.querySelector('#wrapper'), {
              minValue, curValue: data[data.length-1].score, curPrice: data[data.length-1].price, maxValue,
          })
    })
    
  })