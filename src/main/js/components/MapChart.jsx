import React, {
  Component
} from 'react'
import * as d3 from 'd3'
import $ from 'jquery'

class MapChart extends Component {
  constructor (props) {
    super(props)
    this.vis = {
      parentElement: this.props.parentElement
    }
    this.geoData = this.props.geoData
    this.data = this.props.data
    this.formatTime = this.props.formatTime
  }

  componentDidMount () {
    this.drawChart()
  }

  drawChart () {
    const vis = this.vis
    vis.WIDTH = $('#map').width() // take space of the available width's space depending of the device
    vis.mapRatio = 0.5
    vis.HEIGHT = vis.WIDTH * vis.mapRatio
    vis.scale = 5000
    vis.offset = [vis.WIDTH / 2, vis.HEIGHT / 2]
    vis.center = [0.00, 50.64] // approximative center

    // setting up size of the svg
    vis.svg = d3.select('#map').append('svg')
      .attr('width', vis.WIDTH)
      .attr('height', vis.HEIGHT)

    // may be usefull to display some text with variables
    // vis.svg.append('text').attr('x', 0).attr('y', 130).text('variable A').style('font-size', '15px').attr('alignment-baseline','middle')
    // vis.svg.append('text').attr('x', 0).attr('y', 160).text('variable B').style('font-size', '15px').attr('alignment-baseline','middle')

    vis.g = vis.svg.append('g')

    // setting up the tooltip
    vis.tooltip = d3.select('#map')
      .append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('padding', '10px 0px 0px 2px')
      .style('line-height', '1px')

    // approximative projection
    vis.projection = d3.geoMercator()
      .fitSize([vis.WIDTH, vis.HEIGHT])
      .scale(vis.scale)
      .center(vis.center)
      .translate([0, 0])

    vis.path = d3.geoPath()
      .projection(vis.projection)

    this.wrangleData()
  }

  wrangleData () {
    const vis = this.vis
    vis.data = JSON.parse(JSON.stringify(this.data)) // copy object with no reference to avoid perturb the linechart who need data ordered by date asc
    vis.geoData = this.geoData
    console.log(vis.data)
    // sort by date desc because we want recent data
    Object.values(vis.data).forEach(region => {
      region.map(d => {
        d.date = new Date(d.date)
        return d
      })
      region.sort(function (a, b) {
        return b.date - a.date
      })
    })
    console.log(vis.data)
    // console.log(vis.data)
    this.updateVis()
  }

  updateVis () {
    const vis = this.vis
    const parent = this
    // mouseOver tooltip & getting data for the 3 belgium's region
    const mouseover = function (event, d) {
      let lastReport = {}
      if (event.properties.BRK_NAME === 'Brussels') {
        lastReport = vis.data.Brussels[0]
      } else if (event.properties.BRK_NAME === 'Flemish') {
        lastReport = parent.getLastRegionData('Flanders')
      } else if (event.properties.BRK_NAME === 'Walloon') {
        lastReport = parent.getLastRegionData('Wallonia')
      }
      // console.log(lastReport)
      vis.tooltip
        // .html('<p>mouse is over</p>')
        .html(`<p>${parent.formatTime(lastReport.date)}</p>
               <p>Total in : ${lastReport.total_in}</p>
               <p>Total in Resp : ${lastReport.total_in_resp}</p>
               <p>New in : ${lastReport.new_in}</p>
               <p>New out : ${lastReport.new_out}</p>`)
        .style('left', (d3.mouse(this)[0] + 10) + 'px')
        .style('top', (d3.mouse(this)[1] + 70) + 'px')
        .style('opacity', 1)
    }

    // tooltip following mouse
    const mousemove = function (event, d) {
      vis.tooltip
        // .html('<p>mouse is moving</p>')
        .style('left', (d3.mouse(this)[0] + 10) + 'px')
        .style('top', (d3.mouse(this)[1] + 70) + 'px')
    }

    // hide tooltip when mouse is leaving
    const mouseleave = function (d) {
      vis.tooltip.style('opacity', 0)
    }

    // projection with geoData to fit size
    vis.projection = d3.geoMercator()
      .fitSize([vis.WIDTH, vis.HEIGHT], vis.geoData)

    // drawing path
    vis.path = d3.geoPath()
      .projection(vis.projection)
    vis.g.selectAll('path')
      .data(vis.geoData.features)
      .enter()
      .append('path')
      .attr('class', 'region')
      .attr('d', vis.path)
      .on('mouseover', mouseover)
      .on('mousemove', mousemove)
      .on('mouseleave', mouseleave)

    // function to resize map
    const resize = () => {
      vis.WIDTH = parseInt(d3.select('#map').style('width'))
      vis.HEIGHT = vis.WIDTH * vis.mapRatio
      vis.g.attr('width', vis.WIDTH).attr('height', vis.HEIGHT)
      // update projection
      vis.projection
        .fitSize([vis.WIDTH, vis.HEIGHT], vis.geoData)

      // resize the map
      vis.g.selectAll('path').attr('d', vis.path)
    }

    // resize event
    d3.select(window).on('resize', resize)
  }

  // sum the latest data of region's subunits('province')
  getLastRegionData (region) {
    const vis = this.vis
    const lastReport = vis.data[region][0]
    let { total_in, new_in, new_out, total_in_resp, date } = lastReport
    let i = 1
    while (this.formatTime(lastReport.date) === this.formatTime(vis.data[region][i].date)) {
      total_in += vis.data[region][i].total_in
      total_in_resp += vis.data[region][i].total_in_resp
      new_in += vis.data[region][i].new_in
      new_out += vis.data[region][i].new_out
      i++
    }
    return { total_in, total_in_resp, new_in, new_out, date }
  }

  render () {
    return (<h4>Hospitals situation in Belgium by Region (COVID-19)</h4>)
  }
}

export default MapChart
