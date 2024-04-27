import { Display } from 'phaser3';

export default class DebugDrawer {

    constructor(graphics, pixelsPerMeter) {
        this.graphics = graphics;
        this.pixelsPerMeter = pixelsPerMeter;
        this.lineWidth = 3;
    }

    clear() {
        setTimeout(() => this.graphics.clear(), 0);
    }

    DrawSolidPolygon(vertices, vertexCount, color) {
        const c = new Display.Color().setGLTo(color.r, color.g, color.b, 1);
        this.graphics.lineStyle(this.lineWidth, c.color, 1.0);
        this.graphics.beginPath();
        this.graphics.moveTo(vertices[0].x * this.pixelsPerMeter, vertices[0].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[1].x * this.pixelsPerMeter, vertices[1].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[2].x * this.pixelsPerMeter, vertices[2].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[3].x * this.pixelsPerMeter, vertices[3].y * this.pixelsPerMeter);
        this.graphics.lineTo(vertices[0].x * this.pixelsPerMeter, vertices[0].y * this.pixelsPerMeter);
        this.graphics.closePath();
        this.graphics.strokePath();
    }

    PushTransform(xf) {
        this.graphics.save();
        this.graphics.translateCanvas(xf.p.x * this.pixelsPerMeter,
            xf.p.y * this.pixelsPerMeter);
        this.graphics.rotateCanvas(xf.q.GetAngle());
    }

    PopTransform(xf) {
        this.graphics.restore();
    }

    DrawPolygon(vertices, vertexCount, color) {}
    DrawCircle(center, radius, color) {}

    DrawSolidCircle(center, radius, axis, color) {
        let angle = 0;
        const angleStep = 20;
        const n = 360 / angleStep;
        radius = radius * this.pixelsPerMeter;

        const c = new Display.Color().setGLTo(color.r, color.g, color.b, 1);
        this.graphics.lineStyle(3, c.color, 1.0);
        this.graphics.beginPath();
        this.graphics.strokeStyle = `rgb(${color.r * 255},` +
            `${color.g * 255},` + `${color.b * 255})`;

        let x = radius * Math.cos(angle * Math.PI / 180);
        let y = radius * Math.sin(angle * Math.PI / 180);
        this.graphics.moveTo(x, y);
        angle += angleStep;

        for (let i = 0; i < n; i++) {
            x = radius * Math.cos(angle * Math.PI / 180);
            y = radius * Math.sin(angle * Math.PI / 180);
            this.graphics.lineTo(x, y);
            angle += angleStep;
        }
        this.graphics.stroke();
    }

    DrawSegment(p1, p2, color) {}
    DrawTransform(xf) {}
    DrawPoint(p, size, color) {}
}
