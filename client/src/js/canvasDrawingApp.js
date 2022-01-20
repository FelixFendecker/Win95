function CanvasDrawingApp(props) {
    this.canvas
    this.ctx
    this.bgColor

    // Path vars
    this.paths = []
    this.currentPath = []

    // Undo Vars
    this.UndonePaths = []
    this.maxUndos = 10

    // Brush vars
    this.brush
    this.brushColor = "#ffffff"
    this.brushSize = 1

    // Internal system vars
    let pointerDown = false
    
    ////////////////////////////////////////
    // Initialization function (called at creation)
    ////////////////////////////////////////
    const Init = (props) => {
        const {
            canvas,
            width = 100,
            height = 100,
            background = "#00000000"
        } = props

        ////////////////////////////////////////
        // Initialize data members
        ////////////////////////////////////////
        this.bgColor = background;
        this.canvas = canvas;
        this.canvas.width = width;
        this.canvas.height = height;
        this.ctx = this.canvas.getContext('2d');

        ////////////////////////////////////////
        // Init the event listeners
        ////////////////////////////////////////
        this.canvas.addEventListener("touchstart", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointerdown", function(event) {
            event.preventDefault()
            onPointerDown(event)
        })
        // Move
        this.canvas.addEventListener("touchmove", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointermove", function(event) {
            event.preventDefault()
            onPointerDrag(event)
        });
        // Up
        this.canvas.addEventListener("touchend", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointerup", function(event) {
            event.preventDefault()
            onPointerUp(event)
        });
        // Cancel
        this.canvas.addEventListener("touchcancel", function(event) { event.preventDefault() })
        this.canvas.addEventListener("pointercancel", function(event) {
            event.preventDefault()
            onPointerUp(event)
        });

        // Do first frame render
        this.Render()
    }

    ////////////////////////////////////////
    // Render functions
    ////////////////////////////////////////
    // Draw point in path
    const DrawPoint = point => {
        //Create radial gradient brush

        //Set drawing color
        this.ctx.fillStyle = point.color

        // Draw Circle
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, point.size/2, 0, 2 * Math.PI)
        this.ctx.fill()
    }

    // Draw all paths
    this.Render = () => {
        // Draw BG
        this.ctx.fillStyle = this.bgColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw the stored paths
        for (let i = 0; i < this.paths.length; i++) {
            for (let j = 0; j < this.paths[i].length; j++) {
                DrawPoint(this.paths[i][j])
            }
        }

        // Draw current path
        if (this.currentPath) {
            for (let i = 0; i < this.currentPath.length; i++) {
                DrawPoint(this.currentPath[i])
            }
        }
    }

    ////////////////////////////////////////
    // Event functions
    ////////////////////////////////////////
    const GetDistance = (p1, p2) => {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    }

    // Create point for paths
    const CreatePoint = (point, lastPoint) => {

        // Create newest Point
        this.currentPath.push({
            x: point.x,
            y: point.y,
            color: this.brushColor,
            size: this.brushSize
        })

        // Render
        this.Render()
    }

    // Get pointerPos
    const GetPointerPos = event => {
        const rect = event.target.getBoundingClientRect()
        const offsetX = event.pageX - rect.left
        const offsetY = event.pageY - rect.top

        return {x: offsetX, y: offsetY}
    }

    // Start drawing
    const onPointerDown = event => {
        // Reset path and pointerDown
        pointerDown = true
        this.currentPath = []

        // Draw first point in path
        CreatePoint(GetPointerPos(event))
    }

    // Add to path
    const onPointerDrag = event => {
        // Save point in path
        if (pointerDown) {
            CreatePoint(GetPointerPos(event), this.currentPath[this.currentPath.length-1])
        }
    }

    // Stop drawing
    const onPointerUp = event => {
        // Push path into path array
        this.UndonePaths = []
        this.paths.push(this.currentPath)

        // Reset & Render
        this.currentPath = []
        pointerDown = false
        this.Render()
    }

    ////////////////////////////////////////
    // Public functions
    ////////////////////////////////////////
    this.Undo = () => {
        if (this.paths.length > 0 && this.paths.length < this.maxUndos) {
            this.UndonePaths.push(this.paths[this.paths.length-1])
            this.paths.splice(this.paths.length-1, 1)
            this.Render()
        }
    }

    this.Redo = () => {
        if (this.UndonePaths.length > 0) {
            this.paths.push(this.UndonePaths[this.UndonePaths.length-1])
            this.UndonePaths.splice(this.UndonePaths.length-1, 1)
            this.Render()
        }
    }

    // Expected input: 0 - 255
    this.SetOpacity = (val) => {
        // Calculate hex string
        const parsedInt = parseInt(val, 10)
        let hexNum = parsedInt.toString(16)
        if (hexNum.length < 2) hexNum = `0${hexNum}`
        
        // Set opacity
        this.brushColor = `#ffffff${hexNum}`
    }

    ////////////////////////////////////////
    // Run the init function
    ////////////////////////////////////////
    Init(props)
}