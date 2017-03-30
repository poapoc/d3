
/**
 * 整体得分对比图
 */
function gLine(options) {
    this.av = 0;
    this.maxY = 0;
    this.minY = 100;
    this.container = options.container;
    this.data = options.data;
    this.chartWidth = options.width;
    this.chartHeight = options.height;

    this.barWidth = 10;
    this.margin = { top: 30, right: 180, bottom: 100, left: 120 };
    this.width = this.chartWidth - this.margin.left - this.margin.right;
    this.height = this.chartHeight - this.margin.top - this.margin.bottom;

    this.svg = d3.select(this.container).append('svg')
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    /**
     * 获取Y轴最大值最小值
     */
    this.getMinAndMax = function () {
        var sum = 0, len = this.data.length;
        for (var i = 0; i < len; i++) {
            sum += this.data[i].y;
            this.maxY = Math.max(this.maxY, this.data[i].y);
            this.minY = Math.min(this.minY, this.data[i].y);
        }
        this.av = sum / len;
    };

    /**
     * 设置比例并定义XY轴
     */
    this.getScaleAndDefine = function () {
        //定义scale
        this.xScale = d3.scale.ordinal().rangeRoundBands([0, this.width], 1).domain(this.data.map(function (d) { return d.x; }));
        this.yScale = d3.scale.linear().range([this.height, 0]).domain([Math.floor(this.minY / 10 - 1) * 10, Math.ceil(this.maxY / 10) * 10]);

        //定义x轴，y轴
        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom").ticks(10);
        this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);
    };

    /**
     * 整个绘制函数
     */
    this.draw = function () {
        this.getMinAndMax();                                //获取最大最小值
        this.getScaleAndDefine();                           //设置比例并获取XY轴定义
        this.addXaxis();                                    //添加X轴
        this.addyAxis();                                    //添加Y轴
        this.addBar();                                      //添加矩形图
        this.addGradient('grad1', '#2d9ebd', '#1d768f');    //添加渐变
        this.addGradient('grad2', '#eff', '#99e4f5');       //添加渐变
        this.addAverage();                                  //添加均值框 均值线
        this.addEllipse(this.data);                         //添加椭圆
        this.addLegends();                                   //添加图例说明
    };


    /**
     * 添加矩形条
     */
    this.addBar = function () {
        var that = this;
        //添加bar
        this.svg.selectAll(".bar")
            .data(that.data)
            .enter().append("rect")
            .attr("class", "scoreBar")
            .attr("x", function (d, i) { return that.xScale(d.x) - that.barWidth / 2; })
            .attr("width", this.barWidth)
            .attr("y", function (d) { return that.yScale(d.y); })
            .attr("height", function (d) { return that.height - that.yScale(d.y); });

        //添加文字  条形图的Y值
        for (var i = 0; i < this.data.length; i++) {
            var d = this.data[i];
            this.svg.append('text')
                .text(d.y)
                .attr('x', this.xScale(d.x) - 20)
                .attr('y', this.yScale(d.y) - 10)
                .attr('font-family', 'sans-serif')
                .attr('font-size', '16px')
                .attr('fill', '#000');
        }
    };


    /**
     * 当有低分出现时添加椭圆
     */
    this.addEllipse = function () {
        var flag = false, len = this.data.length;
        for (var i = 0; i < len; i++) {
            var tempData = this.data[i], g;
            if (tempData.hasOwnProperty('isLow') && tempData.isLow) {
                if (!flag) {
                    g = this.svg.append('g');
                    flag = true;
                }
                g.append('g')
                    .append('ellipse')
                    .attr({
                        cx: this.xScale(tempData.x),
                        cy: this.yScale(tempData.y) - 10,
                        rx: 12,
                        ry: 36,
                        'class': 'low-ellipse'
                    });
            }
        }
    };


    /**
     * 在svg中添加渐变元素
     * @param id 渐变元素id
     * @param from 颜色起始
     * @param to 颜色终止
     */
    this.addGradient = function (id, from, to) {
        var gradient = this.svg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "100%")
            .attr("id", id);

        gradient.append("svg:stop")
            .attr("offset", "0%")
            .attr("stop-color", from)
            .attr("stop-opacity", 1);

        gradient.append("svg:stop")
            .attr("offset", "100%")
            .attr("stop-color", to)
            .attr("stop-opacity", 1);
    };

    /**
     * 整体得分相关
     */
    this.addAverage = function () {
        //公司整体得分  虚线
        var block = this.svg.append('g');
        block.append('line')
            .attr('class', 'av-line')
            .attr('x1', 0)
            .attr('y1', this.yScale(this.av))
            .attr('x2', this.width)
            .attr('y2', this.yScale(this.av));

        //公司整体得分 框框
        block.append('rect')
            .attr('width', 30)
            .attr('height', 90)
            .attr('class', 'av-scoreBlock')
            .attr('x', this.width + 10)
            .attr('y', this.yScale(this.av) - 45);

        var text = block.append('text')
            .attr('x', this.width + 0)
            .attr('y', this.yScale(this.av) + 20)
            .attr('class', 'av-text');
        var str = this.av.toFixed(2).toString();
        if (str.length > 4) {
            str = str.substr(0, 4);
        }

        var texts = ['公司', '整体', '得分', str];
        var pos = {
            x: this.width + 12,
            y: this.yScale(this.av) - 20
        };

        for (var i = 0; i < texts.length; i++) {
            var textContent = texts[i];
            text.append('tspan')
                .text(textContent)
                .attr({
                    x: pos.x,
                    y: pos.y + i * 20
                })
                .style({
                    'font-size': '12px',
                    'font-weight': '900',
                    'font-family': '微软雅黑'
                });
        }

        block.append('line')
            .attr('x1', this.width)
            .attr('y1', this.height)
            .attr('x2', this.width)
            .attr('y2', 0)
            .attr('class', 'axis');
    };

    /**
     * 添加legends
     */
    this.addLegends = function () {
        var that = this;
        var g = that.svg.append('g');
        var len1 = this.addRectLegend(g, { x: 0, y: that.height + 80 }, 30, 10, 'scoreBar', '整体得分');
        var len2 = this.addLineLegend(g, { x: len1, y: that.height + 80 }, 30, 'company-legend', '公司整体得分');
        var len = len1 + len2;
        var left = (that.width - len) / 2;
        var top = 0;
        g.attr('width', len)
            .attr('height', 30)
            .attr("transform", "translate(" + left + "," + top + ")");
    };


    /**
     * 添加矩形图例
     */
    this.addRectLegend = function (container, pos, width, height, className, textContent) {
        var block = container.append('g');
        block.append('rect')
            .attr('x', pos.x)
            .attr('y', pos.y - height / 2)
            .attr('width', width)
            .attr('height', height)
            .attr('class', className);

        var text = block.append('text')
            .text(textContent)
            .attr('x', pos.x + width + 5)
            .attr('y', pos.y + 5)
            .attr('class', 'node-text');
        return width + 15 + text[0][0].getComputedTextLength();
    };

    /**
     * 添加虚线图例
     */
    this.addLineLegend = function (container, pos, len, lineClass, textContent) {
        var block = container.append('g');
        block.append('line')
            .attr('x1', pos.x)
            .attr('y1', pos.y)
            .attr('x2', pos.x + len)
            .attr('y2', pos.y)
            .attr('class', lineClass);

        var text = block.append('text')
            .text(textContent)
            .attr('x', pos.x + len + 5)
            .attr('y', pos.y + 5)
            .attr('class', 'node-text');
        return len + 5 + text[0][0].getComputedTextLength();
    };


    /**
     * 添加X轴
     */
    this.addXaxis = function () {
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style({
                'font-size': '14px',
                'font-weight': '500',
                'fill': '#000',
                'stroke-width': 0,
                'font-family': '黑体'
            })
            .attr('transform', 'rotate(-30)');
    };

    /**
     * 添加Y轴
     */
    this.addyAxis = function () {
        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    };
}

/**
 * 饼图
 */
function gPie(options) {
    this.values = [];                      //饼图的值             有 20人
    this.names = [];                       //饼图每个值对应的名称 0-22岁  
    this.title = options.title || '';      //标题
    this.pie = d3.layout.pie(this.data);
    this.width = options.width;
    this.height = options.height;
    this.outerRadius = Math.min(this.height / 2, (this.width * 3 / 10)) - 10;    //外半径
    this.innerRadius = 0;                  //圆环内半径
    this.rectWidth = 10;
    this.margin = { top: 60, bottom: 60 };
    this.svg = d3.select(options.container)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    this.dealData = function () {
        options.data.sort(function (a, b) {
            return a.value < b.value;
        });
        var data = options.data;
        var len = data.length;
        for (var i = 0; i < len; i++) {
            this.values.push(data[i].value);
            this.names.push(data[i].name);
        }
    };
    this.colors = ['#c0504d', '#9bba58', '#70578f', '#4571a7', '#db843c', '#4197ae'];


    /**
     * 绘制函数
     */
    this.draw = function () {
        this.dealData();
        this.addTitle();
        this.addPie();
        this.addLegend();

    };

    /**
     *  绘制饼图
     */
    this.addPie = function () {
        var that = this;
        //用svg的path绘制弧形的内置方法
        var arc = d3.svg.arc()
            .outerRadius(this.outerRadius)
            .innerRadius(this.innerRadius); //设置弧度的内外径，等待传入的数据生成弧度

        //准备分组,把每个分组移到图表中心
        var arcs = this.svg.selectAll("g.arc")
            .data(this.pie(this.values))
            .enter()
            .append("g")
            .on('mouseover', function (d) {
                d3.select(this).transition().tween('opacity', function () {
                    var opacity = d3.interpolateNumber(1, 0.8);
                    return function (t) {
                        d3.select(this).style('opacity', opacity(t));
                    };
                });
                // var element = this;
                // d3.select(this)
                //     .transition()
                //     .duration(500)
                //     .tween('transform', function(d) {
                //         console.log(transform);
                //         var transform = "translate(" + that.outerRadius + "," + that.outerRadius + ")";
                //         return function(t) {
                //             d3.select(element).attr('transform', transform);
                //         };
                //     });
            })
            .on('mouseleave', function (d) {
                d3.select(this).transition().tween('opacity', function () {
                    var opacity = d3.interpolateNumber(0.8, 1);
                    return function (t) {
                        d3.select(this).style('opacity', opacity(t));
                    };
                });
            })
            .attr("class", "arc")
            .attr("transform", "translate(" + (that.outerRadius + 10) + "," + (that.outerRadius + 10) + ")");//translate(a,b)a表示横坐标起点，b表示纵坐标起点

        //为组中每个元素绘制弧形路路径
        arcs.append("path")
            .attr("fill", function (d, i) {
                var len = that.colors.length;
                return that.colors[i % len];
            })
            .on('mouseover', function (d) {
                var element = this;
                d3.select(element)
                    .transition()
                    .duration(200)
                    .tween('d', function (d) {
                        var dRadius = d3.interpolateNumber(0, 10);
                        return function (t) {
                            arc.outerRadius(that.outerRadius + dRadius(t))
                                .innerRadius(that.innerRadius);
                            d3.select(element).attr('d', arc);
                        };
                    });
            })
            .on('mouseleave', function () {
                var element = this;
                d3.select(element)
                    .transition()
                    .duration(200)
                    .tween('d', function (d) {
                        var dRadius = d3.interpolateNumber(10, 0);
                        return function (t) {
                            arc.outerRadius(that.outerRadius + dRadius(t))
                                .innerRadius(that.innerRadius);
                            d3.select(element).attr('d', arc);
                        };
                    });
            })
            .attr("d", arc) //将角度转为弧度（d3使用弧度绘制）
            .transition()
            .duration(750)
            .call(arcTween);

        function arcTween(transition) {
            transition.attrTween('d', function (d) {
                var endAngle = d.endAngle;
                var startAngle = d.startAngle;
                var interpolate = d3.interpolate(startAngle, endAngle);
                return function (t) {
                    d.endAngle = interpolate(t);
                    return arc(d);
                };
            });
        }



        //为组中每个元素添加文本
        arcs.append("text")
            .attr("transform", function (d) {
                var center = arc.centroid(d);
                var x = center[0] * 1.8;
                var y = center[1] * 1.8;
                return "translate(" + x + ',' + y + ")"; //计算每个弧形的中心点（几何中心）
            })
            .attr("text-anchor", "left")
            .text(function (d) {
                return d.value; //这里已经转为对象了
            });
    };

    /**
     * 添加标题
     */
    this.addTitle = function () {
        var g = this.svg.append('g')
            .append('text')
            .attr('x', 10)
            .attr('y', 10)
            .style({
                fill: '#000',
                'font-weight': 'bold'
            })
            .text(this.title);
    };

    /**
     * 添加矩形图示
     */
    this.addLegend = function () {
        if (!this.names.length) return;
        var height = this.outerRadius * 2;
        var left = this.outerRadius * 2;
        var that = this;
        var len = this.values.length;
        var g = this.svg.append('g');
        var pos = { x: left + 20, y: this.margin.top };
        var dy = (height - this.margin.top - this.margin.bottom - this.rectWidth) / (len - 1);
        for (var i = 0; i < len; i++) {
            var color = that.colors[i % that.colors.length];
            g.append('rect')
                .attr('x', pos.x)
                .attr('y', pos.y + dy * i)
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', color);
            g.append('text')
                .text(this.names[i])
                .attr('x', pos.x + 15)
                .attr('y', pos.y + dy * i + 10)
                .attr('fill', '#000');
        }
    };
}

/**
 * 条形图
 */
function d3Bar(options) {
    this.maxY = 0;
    this.minY = 100;
    this.data = options.data;
    this.chartWidth = options.width;
    this.chartHeight = options.height;
    this.container = options.container;

    this.barWidth = 30;
    this.margin = { top: 30, right: 180, bottom: 80, left: 120 };
    this.width = this.chartWidth - this.margin.left - this.margin.right;
    this.height = this.chartHeight - this.margin.top - this.margin.bottom;
    this.color = d3.scale.category10();  //颜色

    this.svg = d3.select(this.container).append('svg')
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight)
        .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


    /**
     * 获取Y轴最大值最小值
     */
    this.getMinAndMax = function () {
        var len = this.data.length;
        for (var i = 0; i < len; i++) {
            var values = this.data[i].values;
            for (var j = 0; j < values.length; j++) {
                this.maxY = Math.max(this.maxY, values[j]);
                this.minY = Math.min(this.minY, values[j]);
            }
        }
    };

    /**
     * 设置比例并定义XY轴
     */
    this.getScaleAndDefine = function () {
        //定义scale
        this.xScale = d3.scale.ordinal().rangeRoundBands([0, this.width], 1).domain(this.data.map(function (d) { return d.name; }));
        this.yScale = d3.scale.linear().range([this.height, 0]).domain([Math.floor(this.minY), Math.ceil(this.maxY)]);

        //定义x轴，y轴
        this.xAxis = d3.svg.axis().scale(this.xScale).orient("bottom");
        this.yAxis = d3.svg.axis().scale(this.yScale).orient("left").ticks(5);
    };

    /**
     * 整个绘制函数
     */
    this.draw = function () {
        this.getMinAndMax();                                //获取最大最小值
        this.getScaleAndDefine();                           //设置比例并获取XY轴定义
        this.addXaxis();                                    //添加X轴
        this.addyAxis();                                    //添加Y轴
        this.addBar();                                      //添加矩形图
        if (options.legends && options.legends.length) {
            this.addLegends(options.legends);
        }
    };

    /**
     * 添加图例说明
     * */
    this.addLegends = function (names) {
        var g = this.svg.append('g');
        var pos = {
            x: 0,
            y: 0
        };
        var len = 0;
        for (var i = 0; i < names.length; i++) {
            len += this.addLegend(g, names[i], pos, 30, this.color(i));
            pos.x += len;
        }
        g.attr('transform', 'translate(' + (this.width - len) / 2 + ',' + (this.height + this.margin.bottom - 15) + ')');
    };

    /**
     * 添加单个图例
     * */
    this.addLegend = function (container, name, pos, length, color) {
        var g = container.append('g');
        g.append('line')
            .attr('x1', pos.x)
            .attr('y1', pos.y)
            .attr('x2', pos.x + length)
            .attr('y2', pos.y)
            .style({
                stroke: color,
                'stroke-width': 3,
                'fill': 'none'

            });
        g.append('circle')
            .attr('cx', pos.x + length / 2)
            .attr('cy', pos.y)
            .attr('r', 5)
            .style({
                'fill': color
            });
        var text = g.append('text')
            .attr('x', pos.x + length + 5)
            .attr('y', pos.y + 5)
            .style({
                'textLength': '20px',
                'lengthAdjust': 'spacing',
                'font-size': '20px',
                'font-weight': '500',
                'fill': '#000'
            })
            .text(name);
        return length + 15 + text[0][0].getComputedTextLength();
    };


    /**
     * 添加矩形条
     */
    this.addBar = function () {
        var that = this;
        var indexArr = [];
        var len = that.data[0].values.length;
        //添加bar
        for (var i = 0; i < len; i++) {
            indexArr.push(i);
        }
        indexArr.forEach(function (index) {
            var g = that.svg.append('g');
            g.selectAll(".bar")
                .data(that.data)
                .enter()
                .append("rect")
                .attr("class", "bar")
                .attr("x", function (d) {
                    var mid = that.xScale(d.name);
                    var sX = mid - len * that.barWidth / 2;
                    return sX + index * that.barWidth;
                })
                .attr("width", that.barWidth)
                .attr("y", function (d) {
                    return that.yScale(d.values[index]);
                })
                .attr("height", function (d) { return that.height - that.yScale(d.values[index]); })
                .attr('fill', function (d, j) {
                    if (len > 1) {
                        return that.color(index);
                    } else {
                        return that.color(j);
                    }
                });


        });

        //添加文字  条形图的Y值
        for (i = 0; i < that.data.length; i++) {
            var d = that.data[i];
            var mid = that.xScale(d.name);
            var sX = mid - len * that.barWidth / 2;
            for (var j = 0; j < d.values.length; j++) {
                that.svg.append('text')
                    .text(d.values[j])
                    .attr('x', sX + j * that.barWidth)
                    .attr('y', this.yScale(d.values[j]) - 10)
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', '16px')
                    .attr('fill', '#000');
            }

        }
    };


    /**
     * 添加X轴
     */
    this.addXaxis = function () {
        this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .style({
                'font-size': '14px',
                'font-weight': '500',
                'fill': '#000',
                'stroke-width': 0,
                'font-family': '黑体'
            })
            .attr('transform', 'rotate(-30)');
    };

    /**
     * 添加Y轴
     */
    this.addyAxis = function () {
        this.svg.append("g")
            .attr("class", "y axis")
            .call(this.yAxis);
    };
    return this;
}


/**
 * 正五边形
 */
function fivePolygon(options) {
    this.data = options.data;
    this.clientWidth = options.width;
    this.clientHeight = options.height;
    this.container = options.container;

    this.strokeColor = ['#93b64d', '#bc4643', '#447ab8', '#df5900'];
    this.dotColor = ['#9bba58', '#c0504d', '#4f81bc', '#df5900'];

    this.margin = { top: 0, right: 50, bottom: 100, left: 0 };


    this.width = this.clientWidth - this.margin.left - this.margin.right;
    this.height = this.clientHeight - this.margin.top - this.margin.bottom;


    var R = options.r;

    var PI = 2 * Math.PI;
    this.center = {
        x: this.width / 2,
        y: 200
    };

    this.appendSvg = function () {
        this.svg = d3.select(this.container).append('svg')
            .attr("width", this.clientWidth)
            .attr("height", this.clientHeight)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    };

    /**
     * 根据角度 半径得到旋转后的位置
     * angle是弧度
     * pos为
     */
    this.getPosByAngle = function (r, pos, angle) {
        return {
            x: r * Math.sin(angle) + pos.x,
            y: pos.y - r * Math.cos(angle)
        };
    };

    /**
     *  根据半径 中心点 边的条数获取正N边形的顶点数组
     *  r      半径
     *  center 中心点
     *  count  边数
     **/
    this.getAllPos = function (r, pos, count) {
        var that = this;
        var arr = [
            {
                x: pos.x,
                y: pos.y - r
            }
        ];
        var dAngle = PI / count;
        for (var i = 1; i < count; i++) {
            arr.push(that.getPosByAngle(r, pos, dAngle * i));
        }
        return arr;
    };

    this.valueline = d3.svg.line()
        .x(function (d) {
            return d.x;
        })
        .y(function (d) {
            return d.y;
        });

    /**
     * 渲染单个多边形
     * arr    为多边形顶点位置数组
     * isDash 是否为虚线
     * style  线条样式
     */
    this.renderPolygon = function (arr, isDashed, style) {
        var that = this;
        var newArr = [];
        for (var i = 0; i < arr.length; i++) {
            newArr.push(arr[i]);
        }
        newArr.push(arr[0]);
        var strokeDasharray = isDashed ? 8 : 0;
        var myStyle = style || {
            fill: 'none',
            'stroke-dasharray': strokeDasharray,
            'stroke': '#333',
            'stroke-width': 1
        };

        that.svg.append('g').append('path')
            .style(myStyle)
            .attr('d', that.valueline(newArr));
    };

    /**
     * 画多边形
     */
    this.renderPolygons = function () {
        var that = this;
        that.posArr = that.getAllPos(R, that.center, 5);
        that.posArr2 = that.getAllPos(R - 50, that.center, 5);
        that.posArr3 = that.getAllPos(R - 100, that.center, 5);
        //        that.posArr4 = that.getAllPos(R - 150, that.center, 5);

        that.renderPolygon(that.posArr, true);
        that.renderPolygon(that.posArr2, true);
        that.renderPolygon(that.posArr3, true);
        //        that.renderPolygon(that.posArr4, true);
    };

    /**
     * 渲染指标名
     *
     */
    this.renderIndex = function () {
        var posArr = this.posArr;
        var index = [
            { name: '工作职责', x: posArr[0].x - 40, y: posArr[0].y - 10 },
            { name: '管理', x: posArr[1].x + 5, y: posArr[1].y + 6 },
            { name: '环境', x: posArr[2].x - 20, y: posArr[2].y + 25 },
            { name: '薪酬', x: posArr[3].x - 20, y: posArr[3].y + 25 },
            { name: '职业发展', x: posArr[4].x - 60, y: posArr[4].y + 10 }
        ];
        for (var i = 0; i < posArr.length; i++) {
            this.svg.append('text')
                .attr('x', index[i].x)
                .attr('y', index[i].y)
                .style({
                    'width': '20px',
                    'font-size': '14px',
                    'font-weight': '500',
                    'fill': '#000'
                })
                .text(index[i].name);
        }
    };

    /**
     * 渲染主轴
     * center 中心原点
     * arr    顶点数组
     **/
    this.renderAxis = function (arr) {
        var that = this;
        for (var i = 0; i < that.posArr.length; i++) {
            var pos = that.posArr[i];
            that.svg.append('line')
                .attr('x1', that.center.x)
                .attr('y1', that.center.y)
                .attr('x2', pos.x)
                .attr('y2', pos.y)
                .style({
                    'stroke': '#000',
                    'stroke-width': 1
                });
        }
    };

    /**
     *  按照比例获取点的坐标
     *  pos0  起点
     *  pos1  终点
     *  scale 比例
     *  返回所求点的坐标
     */
    this.getPosByScale = function (pos0, pos1, scale) {
        return {
            x: pos0.x + (pos1.x - pos0.x) * scale,
            y: pos0.y + (pos1.y - pos0.y) * scale
        };
    };

    /**
     * 渲染legend
     *
     *
     */
    this.renderLegend = function (container, name, pos, length, color) {
        var that = this;
        var g = container.append('g');
        g.append('line')
            .attr('x1', pos.x)
            .attr('y1', pos.y)
            .attr('x2', pos.x + length)
            .attr('y2', pos.y)
            .style({
                stroke: color,
                'stroke-width': 3,
                'fill': 'none'

            });
        g.append('circle')
            .attr('cx', pos.x + length / 2)
            .attr('cy', pos.y)
            .attr('r', 5)
            .style({
                'fill': color
            });
        var text = g.append('text')
            .attr('x', pos.x + length + 5)
            .attr('y', pos.y + 5)
            .style({
                //                'textLength': '16px',
                'lengthAdjust': 'spacing',
                'font-size': '16px',
                'font-weight': '500',
                'fill': '#000'
            })
            .text(name);
        return length + 15 + text[0][0].getComputedTextLength();
    };

    /**
     *  根据数据源渲染图表
     */
    this.draw = function () {
        this.appendSvg();           //添加SVG
        this.renderPolygons();      //渲染多边形
        this.renderAxis();          //添加主轴
        this.renderIndex();         //渲染指标
        this.renderLegends();       //渲染图例说明
    };

    /**
     * 渲染图例说明
     * */
    this.renderLegends = function () {
        var that = this;
        var g = that.svg.append('g')
            .attr("transform", "translate(" + 0 + "," + that.height + ")");
        var lengendPos = { x: 0, y: 0 };
        var totalLength = 0;
        for (var i = 0; i < that.data.length; i++) {
            var data = that.data[i].data;
            var arr = [];
            for (var j = 0; j < data.length; j++) {
                arr.push(that.getPosByScale(this.center, that.posArr[j], data[j] / 100));
                that.svg.append('circle')
                    .attr('cx', arr[j].x)
                    .attr('cy', arr[j].y)
                    .attr('r', 5)
                    .style('fill', that.dotColor[i]);
            }
            that.renderPolygon(arr, false, {
                stroke: that.strokeColor[i],
                'stroke-width': '3',
                fill: 'none'
            });
            var dLen = that.renderLegend(g, that.data[i].name, lengendPos, 30, that.strokeColor[i]);
            totalLength += dLen;
            lengendPos.x += dLen;
        }
        var x = this.center.x - totalLength / 2;
        var y = that.height + 60;
        g.attr("transform", "translate(" + x + "," + y + ")");
    };
}


/**
 *  满意度敬业度对比折线图
 */
function lineChart(options) {
    this.data = options.data;
    this.container = options.container;

    /**
     * 获取满意度均值
     */
    this.getSatisfactionAverage = function (sourceData) {
        var sum = 0, len = sourceData.length;
        for (var i = 0; i < len; i++) {
            sum += sourceData[i].y;
        }
        return sum / len;
    };

    /**
     * 获取敬业度均值
     */
    this.getEngagementAverage = function (sourceData) {
        var sum = 0, len = sourceData.length;
        for (var i = 0; i < len; i++) {
            sum += sourceData[i].y1;
        }
        return sum / len;
    };

    var av1 = this.getSatisfactionAverage(this.data);
    var av2 = this.getEngagementAverage(this.data);

    this.chartWidth = options.width;
    this.chartHeight = options.height;

    var margin = { top: 10, right: 120, bottom: 100, left: 80 };
    var width = this.chartWidth - margin.left - margin.right;
    var height = this.chartHeight - margin.top - margin.bottom;

    var svg = d3.select(this.container).append('svg')
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /**
     * 绘制图表
     */
    this.draw = function () {
        this.addXaxis();          //添加X轴
        this.addYaxis();          //添加Y轴
        this.addPaths();          //添加折线
        this.addCircleAndText();  //添加折线上的点以及文字
        this.addAverageLine();    //添加均值线
        this.addAverageBlock();   //添加均值框
        this.addLegends();        //添加图例说明
        this.addTooltips();
        this.addedListeners();
    };

    /**
     * 添加监听
     */
    this.addedListeners = function () {
        var that = this;
        var pNode = svg[0][0].parentNode;
        d3.select(pNode)
            .on('mousemove', function () {
                var mousePos = d3.mouse(this);
                mousePos[0] -= margin.left;
                mousePos[1] -= margin.top;
                var mouseX = mousePos[0] + 10;
                var mouseY = Math.max(10, mousePos[1]) + 10;
                if (mouseX > width) {
                    that.tooltip.style({ visibility: 'hidden' });
                    return false;
                }
                var tooltilWidth = parseInt(that.tooltip.attr('width')) + 10;
                var tooltilHeight = parseInt(that.tooltip.attr('height')) + 10;
                if (mouseX + tooltilWidth > width) {
                    mouseX -= tooltilWidth;
                }
                if (mouseY + tooltilHeight > height) {
                    mouseY -= tooltilHeight;
                }

                var data = that.getNearestData(mousePos[0]);

                var lineX = x(data.x);

                svg.select('line.vertical').remove();

                svg.append('line').attr('x1', lineX)
                    .attr('x2', lineX)
                    .attr('y1', 0)
                    .attr('y2', height)
                    .attr('stroke', '#666')
                    .attr('stroke-width', 0.5)
                    .attr('class', 'vertical');

                var pNode = d3.select(that.tooltip[0][0].parentNode);

                pNode.select('.tooltip-text').remove();
                var dy = 25;
                pNode.append('text')
                    .attr('fill', '#fff')
                    .attr('class', 'tooltip-text')
                    .attr('transform', 'translate(' + 0 + ',' + 0 + ')')
                    .html('<tspan x="' + (mouseX + 5) + '" y="' + (mouseY + dy) + '">部门：' + data.x + '</tspan>' +
                        '<tspan x="' + (mouseX + 5) + '" y="' + (mouseY + 2 * dy) + '">敬业度得分：' + data.y + '</tspan>' +
                        '<tspan x="' + (mouseX + 5) + '" y="' + (mouseY + 3 * dy) + '">满意度得分：' + data.y1 + '</tspan>');

                that.tooltip.attr('x', mouseX).attr('y', mouseY).style({ visibility: 'visible' });
            })
            .on('mouseout', function () {
                that.tooltip.style({ visibility: 'hidden' });
                console.log('123456');
            });
    };

    /**
     * 找到最近的值
     * */
    this.getNearestData = function (mouseX) {
        var index = 0, min = Infinity;
        for (var i = 0; i < this.data.length; i++) {
            var data = this.data[i];
            var xPos = x(data.x);
            if (Math.abs(xPos - mouseX) < min) {
                min = Math.abs(xPos - mouseX);
                index = i;
            }
        }
        return this.data[index];
    };

    /**
     * 添加浮动窗
     */
    this.addTooltips = function () {
        var g = svg.append('g');

        this.tooltip = g.append('rect')
            .attr('width', 160)
            .attr('height', 100)
            .attr('rx', 5)
            .attr('ry', 5)
            .style({
                stroke: '#f00',
                'stroke-width': 0,
                fill: '#000',
                opacity: 0.8,
                zIndex: 9999,
                zoom: 1000,
                visibility: 'hidden'
            });
    };


    //定义scale domain
    var x = d3.scale.ordinal().rangeRoundBands([0, width], 1).domain(this.data.map(function (d) { return d.x; }));
    var y = d3.scale.linear().range([height, 0]).domain([70, 100]);

    //定义x轴，y轴
    var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(10);
    var yAxis = d3.svg.axis().scale(y).orient("left").ticks(10);

    //定义线条
    var valueline = d3.svg.line()
        .interpolate('linear')
        .x(function (d) {
            return x(d.x);
        })
        .y(function (d) { return y(d.y); });

    var valueline1 = d3.svg.line()
        .interpolate('linear')
        .x(function (d) { return x(d.x); })
        .y(function (d) { return y(d.y1); });

    /**
     * 添加单条折线段
     */
    function addSinglePath(lineFunc, sourceData, className) {
        svg.append("path")
            .attr("d", lineFunc(sourceData))
            .attr('class', className);
    }

    /**
     *  添加折线段
     */
    this.addPaths = function () {
        var data = this.data;
        addSinglePath(valueline, data, 's-line');
        addSinglePath(valueline1, data, 'e-line');
    };

    /**
     * 添加legends
     */
    this.addLegends = function () {
        var g = svg.append('g');
        var len1 = this.addLegend(g, { x: 0, y: height + 80 }, 30, 's-line-legend', 's-circle-legend', '满意度');
        var len2 = this.addLegend(g, { x: 100, y: height + 80 }, 30, 'e-line-legend', 'e-circle-legend', '敬业度');
        var len = len1 + len2;
        var left = (width - len) / 2;
        var top = 0;
        g.attr('width', len)
            .attr('height', 30)
            .attr("transform", "translate(" + left + "," + top + ")");
        // g.append('rect')
        //     .attr('width', len + 40)
        //     .attr('height', 30)
        //     .attr('x', -15)
        //     .attr('y', height + 63)
        //     .attr('rx', 10)
        //     .attr('ry', 10)
        //     .style({
        //         stroke: '#666',
        //         'stroke-width': 1,
        //         fill: 'none'
        //     });
    };

    /**
     * @desc  添加单个legend
     * container       父容器
     * pos             线段起点
     * len             线段长度
     * lineClass       线段样式
     * circleClass     圆点样式
     * textContent     legend名
     */
    this.addLegend = function (container, pos, len, lineClass, circleClass, textContent) {
        var block = container.append('g');
        block.attr('class', 'legend-g')
            .on('click', function (e) {
                alert('123');
            });
        block.append('line')
            .attr('x1', pos.x)
            .attr('y1', pos.y)
            .attr('x2', pos.x + len)
            .attr('y2', pos.y)
            .attr('class', lineClass);
        block.append('circle')
            .attr('cx', pos.x + len / 2)
            .attr('cy', pos.y)
            .attr('r', 4)
            .attr('class', circleClass);
        var text = block.append('text')
            .text(textContent)
            .attr('x', pos.x + len + 5)
            .attr('y', pos.y + 5)
            .attr('class', 'node-text');
        return len + 5 + text[0][0].getComputedTextLength();
    };

    /**
     * 添加均值线
     */
    this.addAverageLine = function () {
        //满意度均值线
        var g = svg.append('g');
        g.append('line')
            .attr('class', 'sav-line')
            .attr('x1', 0)
            .attr('y1', y(av2))
            .attr('x2', width)
            .attr('y2', y(av2));
        //敬业度均值线
        g.append('line')
            .attr('class', 'eav-line')
            .attr('x1', 0)
            .attr('y1', y(av1))
            .attr('x2', width)
            .attr('y2', y(av1));
    };

    /**
     * 添加单个框
     * average   均值
     * color     颜色
     * pos       位置
     */
    this.addSingleBlock = function (average, color, pos) {
        svg.append('rect')
            .attr('x', pos.x)
            .attr('y', pos.y - 18)
            .attr('width', 60)
            .attr('height', 30)
            .style('stroke', color)
            .attr('class', 'av-block');

        svg.append('text')
            .text(av1.toFixed(2))
            .attr('x', pos.x + 5)
            .attr('y', pos.y + 5)
            .attr('class', 'av-block-text');
    };

    /**
     * 添加均值框
     */
    this.addAverageBlock = function () {
        this.addSingleBlock(av1, '#d58987', { x: width, y: y(av1) }); //
        this.addSingleBlock(av2, '#638fc5', { x: width, y: y(av2) }); //
    };

    /**
     * 给每个点添加一个小圆以及文字
     *
     */
    this.addCircleAndText = function () {
        var data = this.data;
        var circle = svg.append('g');
        var text = svg.append('g');
        for (var i = 0; i < data.length; i++) {
            var d = data[i];

            circle.append('circle').data([d])
                .attr('cx', x(d.x))
                .attr('cy', y(d.y))
                .attr('r', 5)
                .style('fill', '#c0504d');

            circle.append('circle').data([d])
                .attr('cx', x(d.x))
                .attr('cy', y(d.y1))
                .attr('r', 5)
                .style('fill', '#4f81bd');

            text.append('text')
                .text(d.y)
                .attr('x', x(d.x))
                .attr('y', y(d.y))
                .attr('class', 'node-text');

            text.append('text')
                .text(d.y1)
                .attr('x', x(d.x))
                .attr('y', y(d.y1))
                .attr('class', 'node-text');
        }
    };

    /**
     * 添加 X轴
     */
    this.addXaxis = function () {
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('class', 'x-axis-text')
            .attr('transform', 'rotate(-35)');
    };

    /**
     * 添加 Y轴
     */
    this.addYaxis = function () {
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
    };
}


function doublePie(options) {
    this.datas = options.data;

    this.valuePrefix = [];                 //饼图每个值的前缀
    this.pies = [];

    this.width = options.width;
    this.height = options.height;

    this.originRadius = Math.min(this.width * 1 / 5);

    this.outerRadius = this.originRadius;    //外半径
    this.innerRadius = 0;                  //圆环内半径
    this.rectWidth = 10;
    this.margin = { top: 60, bottom: 60 };
    this.svg = d3.select(options.container)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);

    /**
     * 初始化
     */
    this.initPies = function () {
        for (var i = 0; i < this.datas.length; i++) {
            this.pies.push(d3.layout.pie(this.datas[i]));
        }
    };

    this.dealData = function (data) {
        var len = data.length;
        this.values = [];                      //每个扇形对应的值
        for (var i = 0; i < len; i++) {
            this.values.push(data[i].value);
            this.valuePrefix.push(data[i].valuePrefix);
        }
    };

    /**
     * 绘制函数
     */
    this.draw = function () {
        this.initPies();
        this.drawPies();
        this.drawLine();
    };

    this.drawPies = function () {
        for (var i = 0; i < this.datas.length; i++) {
            this.outerRadius *= 0.8;
            this.drawPie(this.datas[i], i);
        }
    };

    /**
     *
     */
    this.drawPie = function (data, index) {
        this.dealData(data);
        this.addPie(index);
    };

    /**
     *
     */
    this.drawLine = function () {

    };

    /**
     *  绘制饼图
     */
    this.addPie = function (index) {
        var that = this;
        //用svg的path绘制弧形的内置方法
        var arc = d3.svg.arc()
            //.startAngle(0)
            //.endAngle(PI * 2)
            .outerRadius(this.outerRadius)
            .innerRadius(this.innerRadius); //设置弧度的内外径，等待传入的数据生成弧度
        //准备分组,把每个分组移到图表中心
        var transform = {
            left: (that.outerRadius + 100 + index * (that.outerRadius + that.originRadius + 100)),
            top: that.originRadius + 10
        };
        var arcs = this.svg.append('g').selectAll("g.arc")
            .data(this.pies[index](this.values))
            .enter()
            .append("g")
            .attr("class", "arc")
            .attr("transform", "translate(" + transform.left + "," + transform.top + ")");//translate(a,b)a表示横坐标起点，b表示纵坐标起点

        //为组中每个元素绘制弧形路路径
        arcs.append("path")
            .attr("fill", function (d, i) {
                var obj = that.datas[index][i];
                return obj.color;
            })
            .attr("d", arc);//将角度转为弧度（d3使用弧度绘制）

        //为组中每个元素添加文本
        arcs.append("text")
            .attr("transform", function (d) {
                var center = arc.centroid(d);
                var x = center[0] * 2.0;
                var y = center[1] * 2.4;
                return "translate(" + x + ',' + y + ")";
            })
            .attr("text-anchor", "middle")
            .text(function (d, i) {
                var obj = that.datas[index][i];
                return obj.valuePrefix + obj.value + obj.valueSuffix;
            });
    };
}