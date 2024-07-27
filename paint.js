document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('drawingCanvas');
    const context = canvas.getContext('2d');
    const clearCanvasButton = document.getElementById('clearCanvas');
    const penButton = document.getElementById('pen');
    const eraserButton = document.getElementById('eraser');
    const saveCanvasButton = document.getElementById('saveCanvas');
    const undoButton = document.getElementById('undo');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const penType = document.getElementById('penType');
    
    // Select all color buttons
    const colorButtons = document.querySelectorAll('.color-buttons button');
    
    let painting = false;
    let currentColor = colorPicker.value;
    let history = [];
    let isEraser = false;

    function saveCanvasState() {
        localStorage.setItem('canvasState', canvas.toDataURL());
    }

    // Function to load canvas state from local storage
    function loadCanvasState() {
        const savedState = localStorage.getItem('canvasState');
        if (savedState) {
            const img = new Image();
            img.onload = function() {
                context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas before drawing the image
                context.drawImage(img, 0, 0);
            };
            img.src = savedState;
        }
    }

    // Set the canvas dimensions and load saved state
    function resizeCanvas() {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
        loadCanvasState(); // Load saved state after resizing
    }

    // Ensure canvas fills its container initially and load saved state
    function initializeCanvas() {
        resizeCanvas();
        loadCanvasState();
    }

    initializeCanvas();

    // Get the correct coordinates on the canvas
    function getMousePos(canvas, evt) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function getTouchPos(canvas, touch) {
        const rect = canvas.getBoundingClientRect();
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }

    function startPosition(e) {
        painting = true;
        saveState();
        draw(e);
    }

    function endPosition() {
        painting = false;
        context.beginPath();
    }

    function draw(e) {
        if (!painting) return;

        const pos = e.touches ? getTouchPos(canvas, e.touches[0]) : getMousePos(canvas, e);

        context.lineWidth = brushSize.value;
        context.lineCap = penType.value;
        context.strokeStyle = isEraser ? '#FFFFFF' : currentColor; // Use white for eraser

        context.lineTo(pos.x, pos.y);
        context.stroke();
        context.beginPath();
        context.moveTo(pos.x, pos.y);
        saveCanvasState();
    }

    function saveState() {
        history.push(canvas.toDataURL());
    }

    function undo() {
        if (history.length > 0) {
            const lastState = history.pop();
            const img = new Image();
            img.src = lastState;
            img.onload = () => {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0);
                saveCanvasState(); // Update local storage after undo
            };
        }
    }

    function changeColor(color) {
        currentColor = color;
        context.strokeStyle = currentColor;
        isEraser = false; // Switch off eraser when changing color
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mousemove', draw);

    canvas.addEventListener('touchstart', startPosition);
    canvas.addEventListener('touchend', endPosition);
    canvas.addEventListener('touchmove', draw);

    clearCanvasButton.addEventListener('click', () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        history = [];
        localStorage.removeItem('canvasState'); // Clear saved state
    });

    penButton.addEventListener('click', () => {
        currentColor = colorPicker.value;
        context.strokeStyle = currentColor;
        isEraser = false; // Ensure eraser is off
    });

    eraserButton.addEventListener('click', () => {
        isEraser = true;
        context.strokeStyle = '#FFFFFF'; // Set eraser color
    });

    colorPicker.addEventListener('input', (e) => {
        changeColor(e.target.value);
    });

    saveCanvasButton.addEventListener('click', () => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'drawing.png';
        link.click();
    });

    undoButton.addEventListener('click', undo);

    // Add click event listeners to color buttons
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            const color = button.style.backgroundColor;
            changeColor(color);
        });
    });

    window.addEventListener('resize', resizeCanvas);
});
