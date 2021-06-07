// declare canvas, context and clear button
const canvas = document.querySelector("#canv1");
const clear = document.querySelector("#clrbtn");
const ctx = canvas.getContext("2d");

// Helper function to calculate area of a triangle
function calculateArea(p1, p2, p3){
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2.0);
}

// class to store the drag start and stop coordinates
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

//class to store the coordinates of triangle vertices
class Triangle {
    constructor(startPoint, endPoint, color) {
        this.p1 = new Point(startPoint.x + (endPoint.x - startPoint.x) / 2, startPoint.y);
        this.p2 = new Point(startPoint.x, endPoint.y);
        this.p3 = new Point(endPoint.x, endPoint.y);
        this.color = color;

        this.startPoint = startPoint;
        this.endPoint = endPoint;
    }

    drawTriangleOnCanvas(context) {
        context.beginPath();
        context.fillStyle = this.color;
        context.strokeStyle = "black";
        context.lineWidth = 1;
        context.moveTo(this.p1.x, this.p1.y);
        context.lineTo(this.p2.x, this.p2.y);
        context.lineTo(this.p3.x, this.p3.y);
        context.lineTo(this.p1.x, this.p1.y);
        context.stroke();
        context.fill();
        context.closePath();
    }

    isPointInsideTriangle(point) {
        var area = calculateArea(this.p1, this.p2, this.p3);
        var area1 = calculateArea(point, this.p2, this.p3);
        var area2 = calculateArea(this.p1, point, this.p3);
        var area3 = calculateArea(this.p1, this.p2, point);
        return (area == (area1 + area2 + area3));
    }
}

// stores references to triangle objects that are visible on canvas
var spawnedTriangles = [];

// declare variables which point at starting and ending coordinates of the drag event
let startPoint = null;
let endPoint = null;
let dragStartPoint = null; // point of start of dragging a triangle
let diffPoint = null; // intermediate difference in points during dragging a triangle
let dragIntermediatePoint = null; // intermediate start point durong drag

let selectedTriangleIndex = -1; //holds index of triangle in spawnedTriangles array if click point is inside that triangle

let isDragging = false;
let drawNewTriangle = false;

//helper function iterates through spawnedTriangles array and finds index of triangle with which the user intracted 
function getTriangleWithPointInside(point) {
    let triangle = null;
    for (index in spawnedTriangles) {
        triangle = spawnedTriangles[index];
        if (triangle.isPointInsideTriangle(point)) return index;
    }
    return -1;
}

// helper function to clear and re draw all triangles
function redrawCanvas(context, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (triangle of spawnedTriangles) {
        triangle.drawTriangleOnCanvas(context);
    }
}


// mousedown event indicates the starting coordinates of the drag event
canvas.addEventListener("mousedown", e => {
    let cX = canvas.getBoundingClientRect().left + window.scrollX;
    let cY = canvas.getBoundingClientRect().top + window.scrollY;
    startPoint = new Point(e.pageX - cX, e.pageY - cY);
    if (spawnedTriangles.length == 0) {
        isDragging = false;
        drawNewTriangle = true;
    } else {
        selectedTriangleIndex = getTriangleWithPointInside(startPoint);
        if (selectedTriangleIndex > -1) {
            isDragging = true;
            dragStartPoint = new Point(e.pageX - cX, e.pageY - cY);
        } else {
            isDragging = false;
            drawNewTriangle = true;
        }
    }
});

canvas.addEventListener("mousemove", e => {
    if (isDragging && selectedTriangleIndex > -1) {
        let cX = canvas.getBoundingClientRect().left + window.scrollX;
        let cY = canvas.getBoundingClientRect().top + window.scrollY;
        if (dragIntermediatePoint == null) dragIntermediatePoint = dragStartPoint;
        diffPoint = new Point(dragStartPoint.x - dragIntermediatePoint.x, dragStartPoint.y - dragIntermediatePoint.y);
        dragIntermediatePoint = dragStartPoint;
        dragStartPoint = new Point(e.pageX - cX, e.pageY - cY);
        let newStartPoint = new Point(spawnedTriangles[selectedTriangleIndex].startPoint.x + diffPoint.x, spawnedTriangles[selectedTriangleIndex].startPoint.y + diffPoint.y);
        let newEndPoint = new Point(spawnedTriangles[selectedTriangleIndex].endPoint.x + diffPoint.x, spawnedTriangles[selectedTriangleIndex].endPoint.y + diffPoint.y);
        let triangleColor = spawnedTriangles[selectedTriangleIndex].color;
        spawnedTriangles[selectedTriangleIndex] = new Triangle(newStartPoint, newEndPoint, triangleColor);
        redrawCanvas(ctx, canvas);
        diffPoint = null;
    }
});

// mouseup event indicates the ending coordinates of the drag event
canvas.addEventListener("mouseup", e => {
    let cX = canvas.getBoundingClientRect().left + window.scrollX;
    let cY = canvas.getBoundingClientRect().top + window.scrollY;
    endPoint = new Point(e.pageX - cX, e.pageY - cY);

    if (drawNewTriangle) {
        if (startPoint.x !== endPoint.x) {
            if (startPoint.y > endPoint.y) {
                let tempX = startPoint.x;
                let tempY = startPoint.y;
                startPoint.x = endPoint.x;
                startPoint.y = endPoint.y;
                endPoint.x = tempX;
                endPoint.y = tempY;
            }
            
            spawnedTriangles.push(new Triangle(startPoint, endPoint, randomColor()));
            redrawCanvas(ctx, canvas);
        }
    }

    startPoint = null;
    dragStartPoint = null;
    diffPoint = null;
    dragIntermediatePoint = null;
    endPoint = null;
    isDragging = false;
    drawNewTriangle = false;
    selectedTriangleIndex = -1;
});

// double clicking deletes the shape
canvas.addEventListener('dblclick', (e) => { 
    let cX = canvas.getBoundingClientRect().left + window.scrollX; 
    let cY = canvas.getBoundingClientRect().top + window.scrollY;
    point = new Point(e.pageX - cX, e.pageY - cY);
    triangleIndex = getTriangleWithPointInside(point);
    if (triangleIndex > -1) {
        spawnedTriangles.splice(triangleIndex, 1);
        redrawCanvas(ctx, canvas);
    }
});

// function returns random color
function randomColor() {
    var r = Math.round(Math.random( )*256);
    var g = Math.round(Math.random( )*256);
    var b = Math.round(Math.random( )*256);
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

// clear event to clear the canvas
clear.addEventListener('click', (e) => {
    spawnedTriangles = [];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

