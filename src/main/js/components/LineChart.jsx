import React, {
  Component
} from 'react'
import * as d3 from 'd3'

class LineChart extends Component {

  constructor(props) {
    super(props);
    this.state = {
      city: 'Brussels'
    }
  }

  componentDidMount () {
    this.vis = {
      parentElement: this.props.parentElement,
      variable: this.props.variable,
      title: this.props.title,
      filteredData: null
    }
    this.data = this.props.data
    this.drawChart()
  }

  drawChart () {
    const vis = this.vis
    vis.MARGIN = { LEFT: 100, RIGHT: 100, TOP: 50, BOTTOM: 100 }
    vis.WIDTH = 600 - vis.MARGIN.LEFT - vis.MARGIN.RIGHT
    vis.HEIGHT = 500 - vis.MARGIN.TOP - vis.MARGIN.BOTTOM
    vis.svg = d3.select(vis.parentElement).append('svg')
      .attr('viewBox', `0 0 ${vis.WIDTH + vis.MARGIN.LEFT + vis.MARGIN.RIGHT} ${vis.HEIGHT + vis.MARGIN.TOP + vis.MARGIN.BOTTOM}`)

    vis.g = vis.svg.append('g')
      .attr('transform', `translate(${vis.MARGIN.LEFT}, ${vis.MARGIN.TOP})`)

    // for tooltip
    vis.bisectDate = d3.bisector(d => {
      return d.key
    }).left

    vis.g.append('text')
      .attr('x', vis.WIDTH / 2)
      .attr('y', -15)
      .text('Brussels hospitals')

    // add the line for the first time
    vis.g.append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke', 'grey')
      .attr('stroke-width', '3px')

    // axis labels
    vis.xLabel = vis.g.append('text')
      .attr('class', 'x axisLabel')
      .attr('y', vis.HEIGHT + 50)
      .attr('x', vis.WIDTH / 2)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text('Time')
    vis.yLabel = vis.g.append('text')
      .attr('class', 'y axisLabel')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -170)
      .attr('font-size', '25px')
      .attr('text-anchor', 'middle')
      .text(vis.title)

    // scales
    vis.x = d3.scaleTime().range([0, vis.WIDTH])
    vis.y = d3.scaleLinear().range([vis.HEIGHT, 0])

    // axis generators
    vis.xAxisCall = d3.axisBottom()
      .ticks(5)
    vis.yAxisCall = d3.axisLeft()
      .ticks(6)

    // axis groups
    vis.xAxis = vis.g.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0, ${vis.HEIGHT})`)
    vis.yAxis = vis.g.append('g')
      .attr('class', 'y axis')

    this.wrangleData(this.state.city)
  }

  wrangleData (city) {
    const vis = this.vis
    vis.data = JSON.parse(JSON.stringify(this.data));
    // filter by region
    vis.filteredData = vis.data[city]
    // if region have subunits sum the data for the same date
    vis.filteredData = d3.nest()
      .key(function (d) {
        return Date.parse(d.date)
      })
      .rollup(function (v) {
        return d3.sum(v, function (d) {
          return d[vis.variable]
        })
      })
      .entries(vis.filteredData)
    vis.g.select('text').text(city) // update title
    this.updateVis()
  }

  updateVis () {
    const vis = this.vis
    vis.t = d3.transition().duration(1000)

    // update scales
    vis.x.domain(d3.extent(vis.filteredData, d => d.key))
    vis.y.domain([
      d3.min(vis.filteredData, d => d.value),
      d3.max(vis.filteredData, d => d.value)
    ])

    // update axes
    vis.xAxisCall.scale(vis.x)
    vis.xAxis.transition(vis.t).call(vis.xAxisCall)
    vis.yAxisCall.scale(vis.y)
    vis.yAxis.transition(vis.t).call(vis.yAxisCall)

    // clear old tooltips
    vis.g.select('.focus').remove()
    vis.g.select('.overlay').remove()

    /** ******************************* Tooltip Code ********************************/

    vis.focus = vis.g.append('g')
      .attr('class', 'focus')
      .style('display', 'none')

    vis.focus.append('line')
      .attr('class', 'x-hover-line hover-line')
      .attr('y1', 0)
      .attr('y2', vis.HEIGHT)

    vis.focus.append('line')
      .attr('class', 'y-hover-line hover-line')
      .attr('x1', 0)
      .attr('x2', vis.WIDTH)

    vis.focus.append('circle')
      .attr('r', 7.5)

    vis.focus.append('text')
      .attr('x', 15)
      .attr('dy', '.31em')

    vis.g.append('rect')
      .attr('class', 'overlay')
      .attr('width', vis.WIDTH)
      .attr('height', vis.HEIGHT)
      .on('mouseover', () => vis.focus.style('display', null))
      .on('mouseout', () => vis.focus.style('display', 'none'))
      .on('mousemove', mousemove)

    function mousemove () {
      // console.log(vis.filteredData)
      const x0 = vis.x.invert(d3.mouse(this)[0])
      const i = vis.bisectDate(vis.filteredData, x0, 1)
      const d0 = vis.filteredData[i - 1]
      const d1 = i === vis.filteredData.length ? vis.filteredData[i - 1] : vis.filteredData[i] // avoid error on last index
      const d = x0 - d0.key > d1.key - x0 ? d1 : d0
      vis.focus.attr('transform', `translate(${vis.x(d.key)}, ${vis.y(d.value)})`)
      vis.focus.select('text').text(d.value)
      vis.focus.select('.x-hover-line').attr('y2', vis.HEIGHT - vis.y(d.value))
      vis.focus.select('.y-hover-line').attr('x2', -vis.x(d.key))
    }

    // Path generator
    vis.line = d3.line()
      .x(d => vis.x(d.key))
      .y(d => vis.y(d.value))

    // Update our line path
    vis.g.select('.line')
      .transition(vis.t)
      .attr('d', vis.line(vis.filteredData))
  }

  changeCity = (city) => {
    this.setState({
      city: city
    })
  }

  componentDidUpdate() {
    this.wrangleData(this.state.city)
  }

  render () {
    return <div />
  }
}

export default LineChart
