
function drawSVG(id, width, height){
    var SVG = d3.select("#"+id)
        .append("svg")
        .attr("height", height)
        .attr("width", width)
    return SVG;
}

function drawRaddarChart(raddarData){
    // Define the data for the radar chart
    const data = [
        { axis: "Spin", value: raddarData.spin },
        { axis: "Speed", value: raddarData.speed },
        { axis: "Control", value: raddarData.control }
    ];
    console.log(data)

    // Define the dimensions of the chart
    const width = 600; //500
    const height = 500; //600

    // Define the radius of the radar chart
    const radius = Math.min(450, height) / 2;

    // Create an SVG element
    const svg = d3.select("#raddar")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2 - 20})`);

    // Define angles for each axis (in radians)
    const angles = {
        Spin: -Math.PI / 2,     // 0 degrees
        Speed: Math.PI * (135 / 180),   // 135 degrees
        Control: Math.PI * (225 / 180)  // 225 degrees
    };

    // Define the scale for the values
    const valueScale = d3.scaleLinear()
        .domain([0, 10])
        .range([0, radius]);

    // Create concentric circles
    const circleLevels = [2, 4,6,8, 10];
    circleLevels.forEach(level => {
        svg.append("circle")
            .attr("cx", 0) // 0
            .attr("cy", 0)
            .attr("r", valueScale(level))
            .style("fill", "none")
            .style("stroke", "#EDF2F4")
            .style("stroke-dasharray", "3");

            // Add numeric label
        svg.append("text")
        .attr("x",  20)
        .attr("y", -valueScale(level)) // Place label above the circle
        .attr("dy", "-0.5em") // Offset the label slightly above the circle
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "#EDF2F4")
        .text(level);
    });
   
    // Create labels for Spin, Control, and Speed
    const labels = [
        { axis: "Spin", angle: -Math.PI / 2 },      // Spin at 0 degrees
        { axis: "Speed", angle: -Math.PI / 2 + (2 * Math.PI) / 3 },    // Speed at 135 degrees
        { axis: "Control", angle: -Math.PI / 2 + (4 * Math.PI) / 3 }   // Control at 225 degrees
    ];

    // Add labels to the outermost circle
    svg.selectAll(".label")
        .data(labels)
        .enter()
        .append("text")
        .attr("fill", "#EDF2F4")
        .attr("class", "label")
        .attr("x", d => Math.cos(d.angle) * valueScale(10)) // Calculate x-coordinate based on angle and radius of outermost circle
        .attr("y", d => Math.sin(d.angle) * valueScale(10)) // Calculate y-coordinate based on angle and radius of outermost circle
        .attr("dy", "0.35em")
        .attr("text-anchor", d => {
            if (Math.cos(d.angle) < -0.5) return "end"; // Align Spin label to the right
            if (Math.cos(d.angle) > 0.5) return "start"; // Align Control and Speed labels to the left
            return "middle"; // Default alignment for Control and Speed
        })
        .text(d => d.axis);
        
    // Function to draw lines from labels to center
    svg.selectAll(".label-line")
        .data(labels)
        .enter()
        .append("line")
        .attr("class", "label-line")
        .attr("x1", 0) // Starting x-coordinate (center)
        .attr("y1", 0) // Starting y-coordinate (center)
        .attr("x2", d => Math.cos(d.angle) * valueScale(10)) // Ending x-coordinate (based on angle and radius)
        .attr("y2", d => Math.sin(d.angle) * valueScale(10)) // Ending y-coordinate (based on angle and radius)
        .style("stroke", "#EDF2F4")
        .style("stroke-dasharray", "3");

    // Calculate dot positions on label lines
    const dotPoints = labels.map(label => ({
        x: Math.cos(label.angle) * valueScale(data.find(d => d.axis === label.axis).value),
        y: Math.sin(label.angle) * valueScale(data.find(d => d.axis === label.axis).value)
    }));

    
    // Add dots for the triangle points
    svg.selectAll(".dot")
        .data(dotPoints)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", 4)
        .style("fill", "#EDF2F4")
        .transition()
        .duration(1000)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .each(function(d){
                const distance = Math.sqrt(Math.pow(d.x,2)+ Math.pow(d.y,2));
                const normalizedDistance = (distance / radius) * 10
                d3.select(this).append("title")
                    .text(normalizedDistance)
            })

        // Create the triangle using the dots
        svg.append("path")
        .datum(dotPoints)
        .attr("d", d3.line()
            .x(d => 0)
            .y(d => 0)
            .curve(d3.curveLinearClosed))
        .style("fill", "rgba(255, 0, 0, 0.5)")
        .style("stroke", "#EDF2F4")
        .style("stroke-width", "1px")
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveLinearClosed))

}

function createXScale(domain, range){
    return d3.scaleLinear()
        .domain(domain)
        .range(range);
}

function appendTitle(svg, title, width, marginTop){
    svg.append("text")
        .attr("x", width/2)
        .attr("y", marginTop/2)
        .attr("text-anchor", "left")
        .style("font-size", "1.5rem")
        .text(title)
        .style("fill", "#EDF2F4")
}

function appendTooltip(svg, value){
    svg.select('rect')
        .append("title")
        .text(value)
}

function appendXAxis(svg, xAxis, margin){
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top + 30})`)
        .attr("stroke", "#EDF2F4")
        .call(xAxis)
        .selectAll("path")
        .style("stroke", "#EDF2F4")
}

        

//rubbers = JSON.parse("rubbers.json")
let rubbers = {}
$.getJSON("rubbers.json", function(json){
    rubbers = json
    console.log(rubbers)
    var pickedBrand = "Butterfly"

    // Filling brand options
    var brandSelect = document.getElementById("select-brand")
    for(var rubber of rubbers.brands){
        brandSelect.innerHTML += `<option value="${rubber.brand_name}">${rubber.brand_name}</option>`
    }

    // Inital filling of rubbers for a brand
    var rubberSelect = document.getElementById("select-rubber")
    var targetRubbers = rubbers.brands.filter(rubber => rubber.brand_name == "Butterfly")
    rubberSelect.innerHTML += `<option value="">Select rubber</option>`
    for(var rubber of targetRubbers[0].rubbers){
        rubberSelect.innerHTML += `<option value="${rubber.rubber_name}">${rubber.rubber_name}</option>`
    }

    // Dinamic updating rubbers for picked brand
    brandSelect.onchange = function(){
        pickedBrand = brandSelect.options[brandSelect.selectedIndex].value 
        console.log(pickedBrand)
        rubberSelect.innerHTML = ""
        rubberSelect.innerHTML += `<option value="">Select rubber</option>`

        var targetRubbers = rubbers.brands.filter(rubber => rubber.brand_name == pickedBrand)

        for(var rubber of targetRubbers[0].rubbers){
            rubberSelect.innerHTML += `<option value="${rubber.rubber_name}">${rubber.rubber_name}</option>`
        }
    }

    rubberSelect.onchange = function(){
        // Adding visualisation for picked rubber
        var pickedRubber = rubberSelect.options[rubberSelect.selectedIndex].value
        console.log("rubbers",rubbers)
        var targetRubbers = rubbers.brands.filter(rubber => rubber.brand_name == pickedBrand)
        console.log(targetRubbers)
        var rubberData = targetRubbers[0].rubbers.filter(rubber => rubber.rubber_name == pickedRubber)[0]
        //rubberData = rubbers.filter(rubber => rubber.rubber_name == pickedRubber)
        console.log(rubberData)
        console.log(rubberData.properties)


        // Tackiness
        const svgWidth = 480;
        const svgHeight = 180;
        const margin = {top:50, right:50, bottom:50, left:50};

        const width = svgWidth - margin.left - margin.right;
        const height = svgHeight - margin.top - margin.bottom;

        // ##############################################
        // ############### Tackiness ####################
        // ##############################################
        d3.select("#row-tackiness").select("svg").remove()
        const tackinessSVG = drawSVG("row-tackiness", svgWidth, svgHeight);
        var xScale = createXScale([0,10], [0, width])

        appendTitle(tackinessSVG, "Tackiness", width, margin.top)
            
        // Append the bar
        tackinessSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.tackiness));

        appendTooltip(tackinessSVG, rubberData.properties.tackiness)
        
        // Append the x-axis
        var xAxis = d3.axisBottom(xScale)
            .tickFormat(d => {
                switch (d) {
                    case 0:
                        return "Non-tacky";
                    case 5:
                        return "Medium";
                    case 10:
                        return "Extremely"
                    default:
                        return "";
                }
            });

        appendXAxis(tackinessSVG, xAxis, margin)
   
        // ##############################################
        // ############### Weight ####################
        // ##############################################
        d3.select("#row-weight").select("svg").remove()
        const weightSVG = drawSVG("row-weight", svgWidth, svgHeight)
        appendTitle(weightSVG, "Weight", width, margin.top)
    
        // Append the bar
        weightSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.weight))
        
        appendTooltip(weightSVG, rubberData.properties.weight)

        // Append the x-axis
        xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            switch (d) {
                case 0:
                    return "Light";
                case 5:
                    return "Medium";
                case 10:
                    return "Heavy"
                default:
                    return "";
            }
        });

        appendXAxis(weightSVG, xAxis, margin)
     
        // ##############################################
        // ############### Hardness ####################
        // ##############################################
        d3.select("#row-hardness").select("svg").remove()
        
        const hardnessSVG = drawSVG("row-hardness", svgWidth, svgHeight)
        appendTitle(hardnessSVG, "Sponge Hardness", width, margin.top)
   
        // Append the bar
        hardnessSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.sponge_hardness))

        appendTooltip(hardnessSVG, rubberData.properties.sponge_hardness)
        // Append the x-axis
        xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            switch (d) {
                case 0:
                    return "Soft";
                case 5:
                    return "Medium";
                case 10:
                    return "Hard"
                default:
                    return "";
            }
        });

        appendXAxis(hardnessSVG, xAxis, margin)
    
        // ##############################################
        // ############### Gears ####################
        // ##############################################
        d3.select("#row-gears").select("svg").remove()
        
        const gearsSVG = drawSVG("row-gears", svgWidth, svgHeight)
        appendTitle(gearsSVG, "Gears", width, margin.top)

        // Append the bar
        gearsSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.gears))

        appendTooltip(gearsSVG, rubberData.properties.gears)
        // Append the x-axis
        xAxis = d3.axisBottom(xScale)
        appendXAxis(gearsSVG, xAxis, margin)
  
        // ##############################################
        // ############### Throw Angle ##################
        // ##############################################
        d3.select("#row-angle").select("svg").remove()
        
        const angleSVG = drawSVG("row-angle", svgWidth, svgHeight)
        appendTitle(angleSVG, "Throw Angle", width, margin.top)

        // Append the bar
        angleSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.throw_angle))

        appendTooltip(angleSVG, rubberData.properties.throw_angle)
        // Append the x-axis
        xAxis = d3.axisBottom(xScale)
        .tickFormat(d => {
            switch (d) {
                case 0:
                    return "Low";
                case 2:
                    return "Medium-low"
                case 4:
                    return "Medium";
                case 6:
                    return "Medium-high"
                case 8:
                    return "High"
                case 10:
                    return "Very High"
                default:
                    return "";
            }
        });
        appendXAxis(angleSVG, xAxis, margin)

        // ##############################################
        // ############### Consistency ##################
        // ##############################################
        d3.select("#row-consistency").select("svg").remove()
        
        const consistencySVG = drawSVG("row-consistency", svgWidth, svgHeight)
        appendTitle(consistencySVG, "Consistency", width, margin.top)

        // Append the bar
        consistencySVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.consistency))

        appendTooltip(consistencySVG, rubberData.properties.consistency)
        // Append the x-axis
        xAxis = d3.axisBottom(xScale)
        appendXAxis(consistencySVG, xAxis, margin)

        // ##############################################
        // ############### Durability ###################
        // ##############################################
        d3.select("#row-durability").select("svg").remove()
        
        const durabilitySVG = drawSVG("row-durability", svgWidth, svgHeight)
        appendTitle(durabilitySVG, "Durability", width, margin.top)

        // Append the bar
        durabilitySVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.durability))

        appendTooltip(durabilitySVG, rubberData.properties.durability)
        // Append the x-axis
        appendXAxis(durabilitySVG, xAxis, margin)

        // ##########################################
        // ############# Price ######################
        // ##########################################

        d3.select("#row-price").select("svg").remove()
        
        const priceSVG = drawSVG("row-price", svgWidth, svgHeight)
        appendTitle(priceSVG, "Price", width, margin.top)
        xScale = createXScale([0,100], [0, width])
        // Append the bar
        priceSVG.append("rect")
            .attr("class", "bar")
            .attr("height", 30)
            .attr("x", margin.left)
            .attr("y", margin.top-5)
            .style("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attr("width", xScale(rubberData.properties.price))

        appendTooltip(priceSVG, rubberData.properties.price)
        // Append the x-axis
       
        xAxis = d3.axisBottom(xScale)
            .tickFormat(d => {
                switch (d) {
                    case 0:
                        return "Cheap";
                    case 50:
                        return "Medium";
                    case 100:
                        return "Pricy"
                    default:
                        return "";
                }
            });
        appendTooltip(priceSVG, rubberData.properties.price)
        appendXAxis(priceSVG, xAxis, margin)


        // ##############################################
        // ################### Radar chart##################
        // ##############################################
        d3.select("#raddar").select("svg").remove()
        var raddarData = { 
            spin : rubberData.properties.spin,
            speed: rubberData.properties.speed,
            control: rubberData.properties.control 
        }
        console.log(raddarData)
        drawRaddarChart(raddarData);

        // ##############################################
        // ################### Overall ##################
        // ##############################################
        d3.select("#overall").select("svg").remove()

        const donutWidth = 400;
        const donutHeight = 150;
        const radius = Math.min(donutWidth, donutHeight) / 2;
        const innerRadius = radius * 0.6; // Adjust this value to control the size of the hole in the center

        // Overall score (example value)
        const overallScore = rubberData.properties.overall;

        // Create SVG container for the donut chart
        const svg = d3.select("#overall")
            .append("svg")
            .attr("width", donutWidth)
            .attr("height", donutHeight)
            .append("g")
            .attr("transform", `translate(${width-70},${donutHeight/2})`);

        // Define arc generator for the donut segment
        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .startAngle(0)
            .cornerRadius(10);

        // Calculate end angle for the overall score
        const endAngle = (overallScore / 10) * Math.PI * 2;

        // Draw the donut segment for the overall score
        svg.append("path")
            .datum({ endAngle: 0 }) //Inital end angle 0
            .attr("d", arc)
            .attr("fill", "#D80032")
            .style("stroke", "#EDF2F4")
            .transition()
                .duration(1000)
                .attrTween("d", function(d){
                    const interpolate = d3.interpolate(d.endAngle, endAngle);
                    return function(t) {
                        d.endAngle = interpolate(t); // Update end angle based on current transition progress
                        return arc(d); // Generate path string based on updated end angle
                    };
                })
            .attr("fill", "#D80032")

        // Add text in the center for the overall score
        svg.append("text")
            .text(overallScore)
            .attr("text-anchor", "middle")
            .style("fill", "#EDF2F4")
            .attr("dy", "0.35em")
            .style("font-size", "36px")
            .style("font-weight", "bold");

    }
})

