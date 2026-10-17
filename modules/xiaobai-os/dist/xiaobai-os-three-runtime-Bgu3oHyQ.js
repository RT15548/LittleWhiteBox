/* eslint-disable */
import { C as ot, D as at, S as it, _ as nt, a as rt, b as ct, c as Ue, d as lt, f as Te, g as ht, h as Ne, i as pe, l as dt, m as ft, n as ut, o as he, p as se, r as pt, s as mt, u as bt, v as gt, x as yt, y as wt } from "./xiaobai-os-MapBrowser-BQ9Ob0Mc.js";
import { $ as q, B as _t, D as xt, Dt as Ie, E as me, Et as xe, Ft as Me, Gt as E, It as be, L as Mt, O as Be, Q as ge, R as St, Rt as Q, S as vt, St as Et, U as Se, W as Ge, Wt as Z, X as re, _ as ve, b as Pt, d as kt, dt as At, et as Y, g as Tt, h as Ye, it as Le, j as J, kt as Lt, l as de, mt as Ze, n as Rt, nt as Dt, o as te, p as ye, pt as zt, rt as Ot, s as Ke, t as Ct, tt as Ft, ut as jt, v as Ee, w as ce, wt as He, xt as Pe, y as Re, yt as we } from "./xiaobai-os-three.module-DZLCEE7H.js";
import { t as De } from "./xiaobai-os-RoundedBoxGeometry-jJXIS_5M.js";
import { t as Ut } from "./xiaobai-os-BufferGeometryUtils-BVwpfAe2.js";
import { t as Nt } from "./xiaobai-os-GLTFLoader-BUhik4S0.js";
var ze = { type: "change" }, ke = { type: "start" }, We = { type: "end" }, le = new Et(), Oe = new zt(), It = Math.cos(70 * ge.DEG2RAD), G = new E(), H = 2 * Math.PI, C = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, ue = 1e-6, Bt = class extends Tt {
  constructor(e, s = null) {
    super(e, s), this.state = C.NONE, this.target = new E(), this.cursor = new E(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
      LEFT: "ArrowLeft",
      UP: "ArrowUp",
      RIGHT: "ArrowRight",
      BOTTOM: "ArrowDown"
    }, this.mouseButtons = {
      LEFT: re.ROTATE,
      MIDDLE: re.DOLLY,
      RIGHT: re.PAN
    }, this.touches = {
      ONE: Q.ROTATE,
      TWO: Q.DOLLY_PAN
    }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new E(), this._lastQuaternion = new we(), this._lastTargetPosition = new E(), this._quat = new we().setFromUnitVectors(e.up, new E(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new be(), this._sphericalDelta = new be(), this._scale = 1, this._panOffset = new E(), this._rotateStart = new Z(), this._rotateEnd = new Z(), this._rotateDelta = new Z(), this._panStart = new Z(), this._panEnd = new Z(), this._panDelta = new Z(), this._dollyStart = new Z(), this._dollyEnd = new Z(), this._dollyDelta = new Z(), this._dollyDirection = new E(), this._mouse = new Z(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Yt.bind(this), this._onPointerDown = Gt.bind(this), this._onPointerUp = Zt.bind(this), this._onContextMenu = qt.bind(this), this._onMouseWheel = Wt.bind(this), this._onKeyDown = Xt.bind(this), this._onTouchStart = $t.bind(this), this._onTouchMove = Vt.bind(this), this._onMouseDown = Kt.bind(this), this._onMouseMove = Ht.bind(this), this._interceptControlDown = Qt.bind(this), this._interceptControlUp = Jt.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
  }
  connect(e) {
    super.connect(e), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
      passive: !0,
      capture: !0
    }), this.domElement.style.touchAction = "none";
  }
  disconnect() {
    this.domElement.removeEventListener("pointerdown", this._onPointerDown), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.domElement.removeEventListener("pointercancel", this._onPointerUp), this.domElement.removeEventListener("wheel", this._onMouseWheel), this.domElement.removeEventListener("contextmenu", this._onContextMenu), this.stopListenToKeyEvents(), this.domElement.getRootNode().removeEventListener("keydown", this._interceptControlDown, { capture: !0 }), this.domElement.style.touchAction = "auto";
  }
  dispose() {
    this.disconnect();
  }
  getPolarAngle() {
    return this._spherical.phi;
  }
  getAzimuthalAngle() {
    return this._spherical.theta;
  }
  getDistance() {
    return this.object.position.distanceTo(this.target);
  }
  listenToKeyEvents(e) {
    e.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = e;
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(ze), this.update(), this.state = C.NONE;
  }
  update(e = null) {
    const s = this.object.position;
    G.copy(s).sub(this.target), G.applyQuaternion(this._quat), this._spherical.setFromVector3(G), this.autoRotate && this.state === C.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let t = this.minAzimuthAngle, a = this.maxAzimuthAngle;
    isFinite(t) && isFinite(a) && (t < -Math.PI ? t += H : t > Math.PI && (t -= H), a < -Math.PI ? a += H : a > Math.PI && (a -= H), t <= a ? this._spherical.theta = Math.max(t, Math.min(a, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (t + a) / 2 ? Math.max(t, this._spherical.theta) : Math.min(a, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let n = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const i = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), n = i != this._spherical.radius;
    }
    if (G.setFromSpherical(this._spherical), G.applyQuaternion(this._quatInverse), s.copy(this.target).add(G), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let i = null;
      if (this.object.isPerspectiveCamera) {
        const o = G.length();
        i = this._clampDistance(o * this._scale);
        const r = o - i;
        this.object.position.addScaledVector(this._dollyDirection, r), this.object.updateMatrixWorld(), n = !!r;
      } else if (this.object.isOrthographicCamera) {
        const o = new E(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const r = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), n = r !== this.object.zoom;
        const l = new E(this._mouse.x, this._mouse.y, 0);
        l.unproject(this.object), this.object.position.sub(l).add(o), this.object.updateMatrixWorld(), i = G.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      i !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(i).add(this.object.position) : (le.origin.copy(this.object.position), le.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(le.direction)) < It ? this.object.lookAt(this.target) : (Oe.setFromNormalAndCoplanarPoint(this.object.up, this.target), le.intersectPlane(Oe, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const i = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), i !== this.object.zoom && (this.object.updateProjectionMatrix(), n = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, n || this._lastPosition.distanceToSquared(this.object.position) > ue || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > ue || this._lastTargetPosition.distanceToSquared(this.target) > ue ? (this.dispatchEvent(ze), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(e) {
    return e !== null ? H / 60 * this.autoRotateSpeed * e : H / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(e) {
    const s = Math.abs(e * 0.01);
    return Math.pow(0.95, this.zoomSpeed * s);
  }
  _rotateLeft(e) {
    this._sphericalDelta.theta -= e;
  }
  _rotateUp(e) {
    this._sphericalDelta.phi -= e;
  }
  _panLeft(e, s) {
    G.setFromMatrixColumn(s, 0), G.multiplyScalar(-e), this._panOffset.add(G);
  }
  _panUp(e, s) {
    this.screenSpacePanning === !0 ? G.setFromMatrixColumn(s, 1) : (G.setFromMatrixColumn(s, 0), G.crossVectors(this.object.up, G)), G.multiplyScalar(e), this._panOffset.add(G);
  }
  _pan(e, s) {
    const t = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const a = this.object.position;
      G.copy(a).sub(this.target);
      let n = G.length();
      n *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * n / t.clientHeight, this.object.matrix), this._panUp(2 * s * n / t.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / t.clientWidth, this.object.matrix), this._panUp(s * (this.object.top - this.object.bottom) / this.object.zoom / t.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(e, s) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = !0;
    const t = this.domElement.getBoundingClientRect(), a = e - t.left, n = s - t.top, i = t.width, o = t.height;
    this._mouse.x = a / i * 2 - 1, this._mouse.y = -(n / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(e) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, e));
  }
  _handleMouseDownRotate(e) {
    this._rotateStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownDolly(e) {
    this._updateZoomParameters(e.clientX, e.clientX), this._dollyStart.set(e.clientX, e.clientY);
  }
  _handleMouseDownPan(e) {
    this._panStart.set(e.clientX, e.clientY);
  }
  _handleMouseMoveRotate(e) {
    this._rotateEnd.set(e.clientX, e.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const s = this.domElement;
    this._rotateLeft(H * this._rotateDelta.x / s.clientHeight), this._rotateUp(H * this._rotateDelta.y / s.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(e) {
    this._dollyEnd.set(e.clientX, e.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(e) {
    this._panEnd.set(e.clientX, e.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(e) {
    this._updateZoomParameters(e.clientX, e.clientY), e.deltaY < 0 ? this._dollyIn(this._getZoomScale(e.deltaY)) : e.deltaY > 0 && this._dollyOut(this._getZoomScale(e.deltaY)), this.update();
  }
  _handleKeyDown(e) {
    let s = !1;
    switch (e.code) {
      case this.keys.UP:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(H * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), s = !0;
        break;
      case this.keys.BOTTOM:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-H * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), s = !0;
        break;
      case this.keys.LEFT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(H * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), s = !0;
        break;
      case this.keys.RIGHT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-H * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), s = !0;
        break;
    }
    s && (e.preventDefault(), this.update());
  }
  _handleTouchStartRotate(e) {
    if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
    else {
      const s = this._getSecondPointerPosition(e), t = 0.5 * (e.pageX + s.x), a = 0.5 * (e.pageY + s.y);
      this._rotateStart.set(t, a);
    }
  }
  _handleTouchStartPan(e) {
    if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
    else {
      const s = this._getSecondPointerPosition(e), t = 0.5 * (e.pageX + s.x), a = 0.5 * (e.pageY + s.y);
      this._panStart.set(t, a);
    }
  }
  _handleTouchStartDolly(e) {
    const s = this._getSecondPointerPosition(e), t = e.pageX - s.x, a = e.pageY - s.y, n = Math.sqrt(t * t + a * a);
    this._dollyStart.set(0, n);
  }
  _handleTouchStartDollyPan(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enablePan && this._handleTouchStartPan(e);
  }
  _handleTouchStartDollyRotate(e) {
    this.enableZoom && this._handleTouchStartDolly(e), this.enableRotate && this._handleTouchStartRotate(e);
  }
  _handleTouchMoveRotate(e) {
    if (this._pointers.length == 1) this._rotateEnd.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), a = 0.5 * (e.pageX + t.x), n = 0.5 * (e.pageY + t.y);
      this._rotateEnd.set(a, n);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const s = this.domElement;
    this._rotateLeft(H * this._rotateDelta.x / s.clientHeight), this._rotateUp(H * this._rotateDelta.y / s.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(e) {
    if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
    else {
      const s = this._getSecondPointerPosition(e), t = 0.5 * (e.pageX + s.x), a = 0.5 * (e.pageY + s.y);
      this._panEnd.set(t, a);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(e) {
    const s = this._getSecondPointerPosition(e), t = e.pageX - s.x, a = e.pageY - s.y, n = Math.sqrt(t * t + a * a);
    this._dollyEnd.set(0, n), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const i = (e.pageX + s.x) * 0.5, o = (e.pageY + s.y) * 0.5;
    this._updateZoomParameters(i, o);
  }
  _handleTouchMoveDollyPan(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enablePan && this._handleTouchMovePan(e);
  }
  _handleTouchMoveDollyRotate(e) {
    this.enableZoom && this._handleTouchMoveDolly(e), this.enableRotate && this._handleTouchMoveRotate(e);
  }
  _addPointer(e) {
    this._pointers.push(e.pointerId);
  }
  _removePointer(e) {
    delete this._pointerPositions[e.pointerId];
    for (let s = 0; s < this._pointers.length; s++) if (this._pointers[s] == e.pointerId) {
      this._pointers.splice(s, 1);
      return;
    }
  }
  _isTrackingPointer(e) {
    for (let s = 0; s < this._pointers.length; s++) if (this._pointers[s] == e.pointerId) return !0;
    return !1;
  }
  _trackPointer(e) {
    let s = this._pointerPositions[e.pointerId];
    s === void 0 && (s = new Z(), this._pointerPositions[e.pointerId] = s), s.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const s = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[s];
  }
  _customWheelEvent(e) {
    const s = e.deltaMode, t = {
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.deltaY
    };
    switch (s) {
      case 1:
        t.deltaY *= 16;
        break;
      case 2:
        t.deltaY *= 100;
        break;
    }
    return e.ctrlKey && !this._controlActive && (t.deltaY *= 10), t;
  }
};
function Gt(e) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e)));
}
function Yt(e) {
  this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function Zt(e) {
  switch (this._removePointer(e), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(e.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(We), this.state = C.NONE;
      break;
    case 1:
      const s = this._pointers[0], t = this._pointerPositions[s];
      this._onTouchStart({
        pointerId: s,
        pageX: t.x,
        pageY: t.y
      });
      break;
  }
}
function Kt(e) {
  let s;
  switch (e.button) {
    case 0:
      s = this.mouseButtons.LEFT;
      break;
    case 1:
      s = this.mouseButtons.MIDDLE;
      break;
    case 2:
      s = this.mouseButtons.RIGHT;
      break;
    default:
      s = -1;
  }
  switch (s) {
    case re.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(e), this.state = C.DOLLY;
      break;
    case re.ROTATE:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = C.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = C.ROTATE;
      }
      break;
    case re.PAN:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = C.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = C.PAN;
      }
      break;
    default:
      this.state = C.NONE;
  }
  this.state !== C.NONE && this.dispatchEvent(ke);
}
function Ht(e) {
  switch (this.state) {
    case C.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(e);
      break;
    case C.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(e);
      break;
    case C.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(e);
      break;
  }
}
function Wt(e) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== C.NONE || (e.preventDefault(), this.dispatchEvent(ke), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(We));
}
function Xt(e) {
  this.enabled !== !1 && this._handleKeyDown(e);
}
function $t(e) {
  switch (this._trackPointer(e), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Q.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(e), this.state = C.TOUCH_ROTATE;
          break;
        case Q.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(e), this.state = C.TOUCH_PAN;
          break;
        default:
          this.state = C.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Q.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(e), this.state = C.TOUCH_DOLLY_PAN;
          break;
        case Q.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(e), this.state = C.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = C.NONE;
      }
      break;
    default:
      this.state = C.NONE;
  }
  this.state !== C.NONE && this.dispatchEvent(ke);
}
function Vt(e) {
  switch (this._trackPointer(e), this.state) {
    case C.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(e), this.update();
      break;
    case C.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(e), this.update();
      break;
    case C.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(e), this.update();
      break;
    case C.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(e), this.update();
      break;
    default:
      this.state = C.NONE;
  }
}
function qt(e) {
  this.enabled !== !1 && e.preventDefault();
}
function Qt(e) {
  e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function Jt(e) {
  e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
var Ce = {
  table: ["rect", "circle"],
  counter: ["rect"],
  chair: ["rect"],
  bed: ["rect"],
  shelf: ["rect"],
  sofa: ["rect"],
  bridge: ["rect"],
  tree: ["rect", "circle"],
  rock: ["rect", "circle"],
  column: ["rect", "circle"],
  partition: ["rect"],
  ladder: ["rect"],
  well: ["rect", "circle"],
  fountain: ["rect", "circle"],
  fire: ["rect", "circle"],
  flag: ["rect"],
  sign: ["rect"],
  terminal: ["rect"],
  machine: ["rect"],
  "vending-machine": ["rect"]
};
function es(e) {
  if (se(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(Ce, e.icon)) return;
  const s = e.icon;
  return Ce[s].includes(e.shape) ? s : void 0;
}
function ts(e) {
  const [s, t, a, n] = e.viewBox, i = gt(a, n);
  return {
    scale: i,
    point: (o, r, l = 0) => new E((o - s - a / 2) / i, l, (r - t - n / 2) / i)
  };
}
function ss(e, s) {
  const t = Ne(e), a = [t.x + t.width / 2, t.y + t.height / 2], n = nt(e), i = n.points.map(([o, r]) => new Z((o - a[0]) / s, (r - a[1]) / s));
  return n.closed && i.length > 1 && i[0].equals(i[i.length - 1]) && i.pop(), {
    center: a,
    width: t.width / s,
    depth: t.height / s,
    points: i,
    closed: n.closed,
    rotation: -(e.rotation || 0) * Math.PI / 180
  };
}
function os(e, s) {
  const t = new vt(new Lt(e.map((a) => new Z(a.x, -a.y))), {
    depth: s,
    bevelEnabled: !1,
    steps: 1,
    curveSegments: 1
  });
  return t.rotateX(-Math.PI / 2), t;
}
function as(e, s, t) {
  const a = e.map((n) => new E(n.x, t, n.y));
  return s && a.length && a.push(a[0].clone()), new de().setFromPoints(a);
}
function is(e, s, t) {
  const a = [];
  for (let i = 0; i < e.length - (s ? 0 : 1); i += 1) {
    const o = e[i], r = e[(i + 1) % e.length], l = r.clone().sub(o);
    if (!l.lengthSq()) continue;
    const f = new Z(-l.y, l.x).normalize().multiplyScalar(t / 2), h = [
      o.clone().add(f),
      o.clone().sub(f),
      r.clone().add(f),
      r.clone().sub(f)
    ];
    for (const c of [
      0,
      2,
      1,
      1,
      2,
      3
    ]) a.push(h[c].x, 0, h[c].y);
  }
  const n = new de();
  return n.setAttribute("position", new ce(a, 3)), n.computeVertexNormals(), n;
}
function Xe(e, s) {
  return e.slice(0, s ? e.length : -1).flatMap((t, a) => {
    const n = e[(a + 1) % e.length], i = t.distanceTo(n);
    return i ? [{
      x: (t.x + n.x) / 2,
      z: (t.y + n.y) / 2,
      length: i,
      rotation: -Math.atan2(n.y - t.y, n.x - t.x)
    }] : [];
  });
}
function ie(e, s, t) {
  const a = e / 128 * t, n = s / 128 * t, i = Math.floor(a), o = Math.floor(n), r = (c) => c * c * (3 - 2 * c), l = (c, p) => {
    let b = Math.imul(c % t + 17, 374761393) + Math.imul(p % t + 41, 668265263);
    return b = Math.imul(b ^ b >>> 13, 1274126177), ((b ^ b >>> 16) >>> 0) / 4294967296;
  }, f = r(a - i), h = r(n - o);
  return (l(i, o) * (1 - f) + l(i + 1, o) * f) * (1 - h) + (l(i, o + 1) * (1 - f) + l(i + 1, o + 1) * f) * h;
}
function ns(e, s) {
  const a = new Uint8Array(65536);
  let n = 781;
  for (let o = 0; o < 128; o += 1) for (let r = 0; r < 128; r += 1) {
    n = Math.imul(n, 1664525) + 1013904223 >>> 0;
    const l = n / 4294967296;
    let f = 0.94 + l * 0.06;
    if (e === "wood") {
      if (f = 0.94 + Math.sin(o * 0.32 + Math.sin(r * Math.PI / 64) * 0.8 + Math.sin(o * 0.14)) * 0.014 + l * 0.012, s) {
        const c = Math.floor(o / 32);
        f += [
          0,
          0.018,
          -0.015,
          0.01
        ][c], (o % 32 === 0 || (r + c * 47) % 128 === 0) && (f = 0.83);
      }
    } else e === "tile" ? f = r % 64 < 2 || o % 64 < 2 ? 0.73 : 0.96 + l * 0.04 : [
      "fabric",
      "carpet",
      "bed-sheet",
      "tatami"
    ].includes(e) ? f = 0.95 + (r % 4 < 2 == o % 4 < 2 ? 0.012 : 0) + l * 0.018 : e === "stone" || e === "marble" ? f = 0.86 + ie(r, o, 4) * 0.085 + ie(r, o, 16) * 0.035 + l * 0.02 : [
      "grass",
      "forest",
      "dirt",
      "sand",
      "snow"
    ].includes(e) ? f = 0.91 + ie(r, o, 4) * 0.04 + ie(r, o, 16) * 0.025 + l * 0.015 : [
      "water",
      "slime",
      "blood",
      "flesh"
    ].includes(e) ? f = 0.92 + (ie(r, o, 4) * 0.6 + ie(r, o, 8) * 0.4) * (e === "flesh" ? 0.06 : 0.035) + l * 8e-3 : e === "metal" && (f = 0.97 + Math.sin(o * 2) * 8e-3 + l * 0.012);
    const h = Math.round(f * 255);
    a.set([
      h,
      h,
      h,
      255
    ], (o * 128 + r) * 4);
  }
  const i = new Ee(a, 128, 128, Pe);
  return i.colorSpace = xe, i.wrapS = i.wrapT = He, s && e === "wood" && i.repeat.set(0.28, 0.28), i.magFilter = Se, i.minFilter = Ge, i.generateMipmaps = !0, i.anisotropy = 4, i.needsUpdate = !0, i;
}
function rs(e, s) {
  const t = yt(e), a = ct[e];
  function n(i, o) {
    const r = o ? i : new Uint8Array(t.size * t.size * 4);
    if (!o) for (let f = 0; f < i.length; f++) r.set([
      i[f],
      i[f],
      i[f],
      255
    ], f * 4);
    const l = s.own(new Ee(r, t.size, t.size, Pe));
    return o && (l.colorSpace = xe), l.wrapS = l.wrapT = He, l.repeat.setScalar(1 / a.size), l.magFilter = Se, l.minFilter = Ge, l.generateMipmaps = !0, l.anisotropy = 4, l.needsUpdate = !0, l;
  }
  return {
    map: n(t.color, !0),
    bumpMap: n(t.height, !1),
    roughnessMap: n(t.roughness, !1),
    bumpScale: a.relief
  };
}
var cs = {
  ...ot,
  wood: "#966f51",
  stone: "#a5b0b9",
  tile: "#d2dce2",
  carpet: "#956e78",
  fabric: "#608e92",
  "bed-sheet": "#e3e7e9",
  metal: "#98acbf",
  glass: "#b3deeb",
  marble: "#e5e6e7",
  water: "#458da9",
  grass: "#94b67d",
  forest: "#4e8666"
};
function ls(e, s, t) {
  const a = pe(t), n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function l(c, p = 0, b = !1) {
    const g = c.material || (c.category === "water" ? "water" : "unknown"), y = b && it(g) ? g : void 0, P = `${g}:${c.category}:${c.certainty}:${p}:${!!y}`;
    let M = n.get(P);
    if (!M) {
      const _ = {
        danger: "#d77c80",
        magic: "#b29cdb",
        light: "#f4d697",
        actor: "#4598cf",
        marker: "#72b9cb",
        secret: "#8d9ca9"
      }, d = c.category === "terrain", m = g === "wood" && d ? "#b69a77" : cs[g], w = new ye(y ? "#ffffff" : !c.material && c.category in _ ? _[c.category] : m);
      w.lerp(new ye(p > 0 ? "#ffffff" : "#201c1a"), Math.abs(p));
      const x = he(c, "").opacity * (g === "glass" ? 0.42 : g === "slime" ? 0.88 : 1), u = !y && ![
        "unknown",
        "glass",
        "rune",
        "warm-light",
        "cold-light",
        "shadow"
      ].includes(g), O = `${g}:${d}`;
      u && !o.has(O) && o.set(O, e.own(ns(g, d)));
      const z = u ? o.get(O) : null;
      y && !r.has(y) && r.set(y, rs(y, e));
      const j = y ? r.get(y) : void 0, B = [
        "water",
        "slime",
        "flesh",
        "blood",
        "glass"
      ].includes(g);
      M = e.own(new Ot({
        color: w,
        roughness: g === "metal" ? 0.35 : B ? 0.26 : g === "wood" ? 0.63 : 0.86,
        metalness: g === "metal" ? 0.65 : 0,
        transparent: x < 1,
        opacity: x,
        clearcoat: B ? 0.65 : 0,
        clearcoatRoughness: 0.23,
        dithering: !0,
        depthWrite: x >= 1,
        side: 2,
        map: z,
        bumpMap: z,
        bumpScale: g === "stone" || g === "dirt" ? 0.055 : B ? 0.018 : 0.014,
        emissive: [
          "rune",
          "warm-light",
          "cold-light"
        ].includes(g) ? w : "#000000",
        emissiveIntensity: g === "warm-light" || g === "cold-light" ? a.lampEmission : 0.18,
        ...j && {
          ...j,
          roughness: 1
        }
      })), n.set(P, M);
    }
    return M;
  }
  function f(c) {
    const p = `${c.certainty}:${c.category}`;
    let b = i.get(p);
    if (!b) {
      const g = c.certainty && c.certainty !== "confirmed";
      b = e.own(new _t({
        color: s ? "#91a4b2" : "#596d78",
        dashSize: c.certainty === "unknown" ? 0.035 : 0.12,
        gapSize: g ? 0.09 : 0,
        transparent: !0,
        opacity: he(c, "").opacity * (g ? 0.7 : 0.28)
      })), i.set(p, b);
    }
    return b;
  }
  function h(c, p = 0) {
    const b = t?.artificial === "on" ? c.material === "cold-light" ? "cold-light" : "warm-light" : "bed-sheet";
    return l({
      ...c,
      material: b
    }, p);
  }
  return {
    mesh: l,
    ground: (c) => l(c, 0, !0),
    line: f,
    lampShade: h
  };
}
var $e = class {
  resources = /* @__PURE__ */ new Set();
  own(e) {
    return this.resources.add(e), e;
  }
  dispose() {
    for (const e of this.resources) e.dispose();
    this.resources.clear();
  }
};
function hs(e, s, t, a) {
  const { cylinder: n, ring: i, cone: o } = a;
  switch (e) {
    case "column": {
      const r = s.shape === "circle" ? n : void 0;
      return t(0, 0.08, 0, 1, 0.16, 1, -0.12, r), t(0, 0.91, 0, 0.68, 1.5, 0.68, 0.02, r), t(0, 1.7, 0, 0.9, 0.12, 0.9, 0.12, r), 1.76;
    }
    case "partition":
      for (const r of [-0.4, 0.4])
        t(r, 0.055, 0, 0.15, 0.11, 1, -0.18), t(r, 0.79, 0, 0.07, 1.5, 0.15, -0.15);
      return t(0, 0.83, 0, 0.78, 1.27, 0.09, 0.08), t(0, 1.5, 0, 0.88, 0.06, 0.15, 0.14), 1.54;
    case "ladder":
      for (const r of [-0.36, 0.36]) t(r, 0.9, 0, 0.09, 1.8, 0.2, -0.1);
      for (let r = 0; r < 6; r++) t(0, 0.18 + r * 0.29, 0, 0.7, 0.055, 0.16, 0.13);
      return 1.8;
    case "well":
      return t(0, 0.21, 0, 0.94, 0.42, 0.94, -0.08, i, s.material || "stone"), t(0, 0.44, 0, 1, 0.08, 1, 0.12, i, s.material || "stone"), 0.48;
    case "fountain":
      return t(0, 0.03, 0, 0.92, 0.06, 0.92, -0.2, n, s.material || "stone"), t(0, 0.13, 0, 1, 0.2, 1, 0.1, i, s.material || "stone"), t(0, 0.38, 0, 0.18, 0.7, 0.18, -0.06, n, s.material || "stone"), t(0, 0.72, 0, 0.48, 0.1, 0.48, 0.12, i, s.material || "stone"), t(0, 0.85, 0, 0.08, 0.17, 0.08, -0.12, n, s.material || "stone"), 0.935;
    case "fire":
      return t(0, 0.055, 0, 0.85, 0.11, 0.17, -0.28, void 0, "wood"), t(0, 0.11, 0, 0.17, 0.11, 0.85, -0.15, void 0, "wood"), t(0, 0.43, 0, 0.6, 0.62, 0.6, 0, o, "warm-light"), t(0.1, 0.31, 0.12, 0.32, 0.4, 0.32, 0.35, o, "warm-light"), 0.74;
    case "flag":
      return t(-0.37, 0.035, 0, 0.25, 0.07, 0.7, -0.22), t(-0.37, 0.8, 0, 0.045, 1.6, 0.08, -0.15), t(0.04, 1.28, 0, 0.77, 0.46, 0.035, 0.1, void 0, s.material || "fabric"), 1.6;
    case "sign":
      for (const r of [-0.3, 0.3])
        t(r, 0.055, 0, 0.18, 0.11, 0.85, -0.22), t(r, 0.62, 0, 0.07, 1.2, 0.16, -0.12);
      return t(0, 0.9, 0, 1, 0.64, 0.18, -0.05), t(0, 0.9, 0.095, 0.9, 0.52, 0.025, 0.22), 1.22;
    case "terminal":
      return t(0, 0.065, 0, 0.72, 0.13, 0.84, -0.25), t(0, 0.54, -0.09, 0.4, 1, 0.44, -0.1), t(0, 1.1, -0.12, 1, 0.7, 0.3, -0.16), t(0, 1.11, 0.04, 0.86, 0.54, 0.025, -0.6), t(0, 0.77, 0.21, 0.88, 0.06, 0.55, 0.12), 1.45;
    case "machine":
      t(0, 0.055, 0, 1, 0.11, 1, -0.25), t(-0.16, 0.39, 0, 0.62, 0.64, 0.82, 0), t(-0.16, 0.79, 0, 0.54, 0.22, 0.72, 0.15), t(0.34, 0.46, 0, 0.26, 0.76, 0.73, -0.14);
      for (const r of [
        -0.34,
        -0.2,
        -0.06,
        0.08
      ]) t(r, 0.5, 0.421, 0.04, 0.3, 0.014, -0.5);
      return 0.9;
    case "vending-machine":
      return t(0, 0.1, 0, 0.94, 0.2, 0.86, -0.25), t(0, 0.92, 0, 1, 1.68, 0.92, -0.02), t(-0.12, 1.11, 0.468, 0.64, 1.05, 0.018, -0.5), t(0.34, 1.05, 0.48, 0.17, 0.38, 0.03, -0.18), t(0, 0.31, 0.468, 0.74, 0.18, 0.018, -0.65), t(0, 1.73, 0, 1, 0.07, 0.98, 0.16), 1.765;
  }
}
function ds(e, s) {
  const t = e.own(new De(1, 1, 1, 3, 0.035)), a = e.own(new De(1, 1, 1, 4, 0.16)), n = e.own(t.clone()), i = n.getAttribute("position");
  for (let c = 0; c < i.count; c += 1) {
    const p = 0.72 + 0.28 * (i.getY(c) + 0.5);
    i.setX(c, i.getX(c) * p), i.setZ(c, i.getZ(c) * p);
  }
  n.computeVertexNormals();
  const o = e.own(new ve(0.5, 0.5, 1, 32)), r = e.own(new Me(0.5, 16, 10)), l = e.own(new Pt(0.5, 0)), f = e.own(new Ye(0.5, 1, 9)), h = e.own(new Mt([
    [0.35, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [0.35, 0.5],
    [0.35, -0.5]
  ].map(([c, p]) => new Z(c, p)), 32));
  return function(p, b, g, y, P) {
    const M = Math.min(1.6, Math.min(y, P)), _ = /* @__PURE__ */ new Map();
    function d(u, O, z, j, B, A, k = 0, S = t, F) {
      const N = s.mesh(F ? {
        ...b,
        material: F
      } : b, k), L = `${S.uuid}:${N.uuid}`;
      _.has(L) || _.set(L, {
        geometry: S,
        material: N,
        matrices: []
      }), _.get(L).matrices.push(new q().makeScale(j * y, B * M, A * P).setPosition(u * y, O * M, z * P));
    }
    function m(u) {
      for (const O of [-0.37, 0.37]) for (const z of [-0.36, 0.36]) d(O, u / 2, z, 0.075, u, 0.075, -0.16, n);
    }
    function w() {
      switch (g) {
        case "table":
          if (b.shape === "circle")
            d(0, 0.6, 0, 1, 0.08, 1, 0.12, o), d(0, 0.29, 0, 0.18, 0.58, 0.18, -0.15, o), d(0, 0.04, 0, 0.43, 0.08, 0.43, -0.22, o);
          else {
            m(0.58);
            for (const u of [-0.36, 0.36]) d(0, 0.52, u, 0.83, 0.13, 0.045, -0.12);
            for (const u of [-0.37, 0.37]) d(u, 0.52, 0, 0.045, 0.13, 0.75, -0.12);
            d(0, 0.607, 0, 0.98, 0.065, 0.98, -0.1), d(0, 0.651, 0, 1, 0.035, 1, 0.12);
          }
          return 0.67 * M;
        case "chair":
          m(0.52), d(0, 0.55, 0.035, 1, 0.08, 0.93, 0.06), d(0, 0.595, 0.05, 0.91, 0.035, 0.83, 0.16);
          for (const u of [-0.42, 0.42]) d(u, 0.82, -0.425, 0.095, 0.73, 0.12, -0.1);
          for (const u of [
            -0.22,
            0,
            0.22
          ]) d(u, 0.9, -0.425, 0.12, 0.42, 0.07, 0.02);
          d(0, 1.14, -0.425, 0.96, 0.1, 0.14, 0.12);
          for (const u of [-0.37, 0.37]) d(u, 0.23, 0, 0.035, 0.045, 0.74, -0.12);
          return 1.19 * M;
        case "bed":
          return m(0.2), d(0, 0.24, 0, 1, 0.18, 1, -0.2), d(0, 0.39, 0.02, 0.96, 0.16, 0.92, 0.55), d(0, 0.5, 0.15, 0.98, 0.06, 0.63, 0.08), d(0, 0.5, -0.29, 0.64, 0.13, 0.22, 0.65), d(0, 0.47, -0.47, 1, 0.7, 0.06, -0.16), 0.82 * M;
        case "counter":
          d(0, 0.08, 0, 0.9, 0.16, 0.86, -0.28), d(0, 0.57, 0, 0.94, 0.9, 0.91, -0.08), d(0, 0.17, 0.46, 0.96, 0.1, 0.06, 0.06), d(0, 0.94, 0.46, 0.96, 0.08, 0.06, 0.08);
          for (const u of [
            -0.32,
            0,
            0.32
          ])
            d(u, 0.55, 0.46, 0.28, 0.66, 0.045, 0.03), d(u, 0.55, 0.487, 0.235, 0.52, 0.02, -0.09);
          return d(0, 1.025, 0, 1, 0.065, 1, -0.18), d(0, 1.065, 0, 1, 0.03, 1, 0.16), 1.08 * M;
        case "shelf":
          d(0, 1.05, -0.47, 1, 2.1, 0.06, -0.2);
          for (const u of [-0.48, 0.48]) d(u, 1.05, 0, 0.04, 2.1, 1, -0.08);
          for (let u = 0; u < 4; u += 1) d(0, 0.04 + u * 0.67, 0, 1, 0.06, 1, 0.12);
          for (const u of [-0.17, 0.17]) d(u, 1.03, 0, 0.025, 1.98, 0.92, -0.04);
          return d(0, 2.06, 0, 1, 0.08, 1, 0.16), 2.1 * M;
        case "sofa":
          m(0.14), d(0, 0.26, 0, 0.96, 0.27, 0.96, -0.18), d(0, 0.65, -0.37, 0.98, 0.76, 0.26, -0.08, a);
          for (const u of [-0.44, 0.44]) d(u, 0.52, 0, 0.12, 0.49, 0.98, 0.02, a);
          for (const u of [
            -0.26,
            0,
            0.26
          ])
            d(u, 0.46, 0.11, 0.245, 0.19, 0.72, 0.12, a), d(u, 0.77, -0.22, 0.245, 0.43, 0.22, 0.08, a);
          return 1.04 * M;
        case "bridge":
          for (let u = 0; u < 12; u += 1) d(0, 0.16, -0.46 + u * 0.083, 1, 0.1, 0.075, u % 2 ? 0.1 : 0);
          for (const u of [-0.45, 0.45]) {
            d(u, 0.61, 0, 0.045, 0.045, 1, -0.15);
            for (const O of [
              -0.45,
              0,
              0.45
            ]) d(u, 0.35, O, 0.055, 0.55, 0.04, -0.18);
          }
          return 0.65 * M;
        case "tree":
          return d(0, 0.44, 0, 0.14, 0.88, 0.14, -0.42, o), d(0, 1.04, 0, 1, 1.2, 1, -0.04, r), d(-0.16, 1.3, -0.06, 0.6, 0.65, 0.6, 0.13, r), 1.65 * M;
        case "rock":
          return d(0, 0.29, 0, 1, 0.62, 1, 0.03, l), 0.6 * M;
        default:
          return hs(g, b, d, {
            cylinder: o,
            ring: h,
            cone: f
          }) * M;
      }
    }
    const x = w();
    for (const { geometry: u, material: O, matrices: z } of _.values()) {
      const j = e.own(new J(u, O, z.length));
      z.forEach((B, A) => j.setMatrixAt(A, B)), j.castShadow = O.opacity >= 0.8, j.receiveShadow = !0, p.add(j);
    }
    return x;
  };
}
var fs = /* @__PURE__ */ JSON.parse('[{"icon":"table","file":"table.glb","originalFile":"furniture/Models/GLTF format/table.glb","sourceSha256":"ff1a94498d023957f4bc3ff6f55a7a82977d336dbf01a573b3364f03afe5ff61","sha256":"07cd3bfb1f6884b7476a2e6222f735bbd0e7ff9b29c59f210d9a06fe9f1ba5e8","bytes":12476,"triangles":120,"batches":1,"geometryBytes":11520,"size":[0.8414879441261292,0.3267339766025543,0.44737333059310913],"radius":0.4765094062648687},{"icon":"chair","file":"chairRounded.glb","originalFile":"furniture/Models/GLTF format/chairRounded.glb","sourceSha256":"53f4933ec547179c499f04dbda1231cf44b83ec82c7f4ab981cdf680aee5c973","sha256":"f62c6c7e655f8360971bd859c14c150a1f77355f14b5379b29cdd6d1fb97db4c","bytes":27844,"triangles":280,"batches":1,"geometryBytes":26880,"size":[0.20000000298023224,0.45499998331069946,0.20000000298023224],"radius":0.14142135834465194},{"icon":"bed","file":"bedSingle.glb","originalFile":"furniture/Models/GLTF format/bedSingle.glb","sourceSha256":"ca00c63f9a12da3138d902b2f5f18e0360fb6e8a5ac42ccb4bc3f185724b65d1","sha256":"b89c28f9ad8e77ddbc8fd9bcfb8a8f87157a7c8971dd20ee0718b6f585629c89","bytes":22864,"triangles":214,"batches":3,"geometryBytes":20544,"size":[0.5709999799728394,0.375,1.125],"radius":0.6294541280557842},{"icon":"shelf","file":"bookcaseOpenLow.glb","originalFile":"furniture/Models/GLTF format/bookcaseOpenLow.glb","sourceSha256":"6d4d625faf977a2dbf155f1313cd32c6310e463114a1cd4c08cb9f80a5fb1d75","sha256":"c67a8d18cd802afb82d74a73d0c0dc85a7188facbfb5ede13909b9bc6cc33226","bytes":18596,"triangles":184,"batches":1,"geometryBytes":17664,"size":[0.4000000059604645,0.4000000059604645,0.25],"radius":0.23584953082864699},{"icon":"tree","file":"tree_oak.glb","originalFile":"nature/Models/GLTF format/tree_oak.glb","sourceSha256":"d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3","sha256":"adb24a59f159f214971fefe7e51539d7a938a8a3908b0d756c25e914d0bce681","bytes":20500,"triangles":196,"batches":2,"geometryBytes":18816,"size":[0.6405540108680725,1.2262399204075336,0.7396479845046997],"radius":0.36982402101696993},{"icon":"rock","file":"stone_largeE.glb","originalFile":"nature/Models/GLTF format/stone_largeE.glb","sourceSha256":"392cf28f85aa4b7b7c5e12b1a3b87fe2b3a7c5ec1797d5d1d0d58edca6da9de8","sha256":"07185b2e5f8ce40fc14e8c29db249fa607da56651abcf22f93f8c02f4d7512af","bytes":7116,"triangles":64,"batches":1,"geometryBytes":6144,"size":[1.095458745956421,0.2922479815781114,0.9198710918426514],"radius":0.5865749968024526},{"icon":"stool","file":"stoolBar.glb","originalFile":"furniture/Models/GLTF format/stoolBar.glb","sourceSha256":"a86167a9f92401a61fec7e509ad089ecc552d0f299743add3aeb919acb24e341","sha256":"6fe6e654458f50ab7e73cc5977f055a50562cb74a56a8bd5ebaac312f03c4563","bytes":17852,"triangles":176,"batches":1,"geometryBytes":16896,"size":[0.2654399871826172,0.4350000023841858,0.2298777848482132],"radius":0.13272000284524055},{"icon":"bench","file":"bench.glb","originalFile":"furniture/Models/GLTF format/bench.glb","sourceSha256":"ba05a6d23a5a5a44da016757632070e47ff7587ce10e2f6d6d52328b4cf5489b","sha256":"21bd02dce1f980aff3bc22c916bdcbefa3db2fa11bd5dbbc9fbb07830f9bd87b","bytes":17280,"triangles":170,"batches":1,"geometryBytes":16320,"size":[0.4000000059604645,0.4699999988079071,0.20000000298023224],"radius":0.22360680108197992},{"icon":"sofa","file":"loungeSofa.glb","originalFile":"furniture/Models/GLTF format/loungeSofa.glb","sourceSha256":"1886b811c0d3ad0d8525a4fd43adf4112c497c8e0ed906f06877ca3517f4c7dd","sha256":"a4a0b16aa48731b61fcc08302c8bca8d2ff9e1ae41e77893ed9f2091f8a35ee2","bytes":13952,"triangles":128,"batches":2,"geometryBytes":12288,"size":[0.9799999594688416,0.46000000834465027,0.4100000262260437],"radius":0.5311543895291386},{"icon":"cabinet","file":"kitchenCabinet.glb","originalFile":"furniture/Models/GLTF format/kitchenCabinet.glb","sourceSha256":"7238c57778935ae25db5e57e9f7af3ba7068c71b005ff7cfbff3b6f3b1a13200","sha256":"0f9b3693f3de853fa68148bb71c9e29ecf38e784bfa7e39a7fb3cc78f76ce972","bytes":12604,"triangles":114,"batches":2,"geometryBytes":10944,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"stove","file":"kitchenStove.glb","originalFile":"furniture/Models/GLTF format/kitchenStove.glb","sourceSha256":"3239edb36295dfca9530a9b9a6ad0aff98ce62e7cf8d13ca2a5a1a6b2a904656","sha256":"6d1deee24fa30890cbfc540fa6e711fce2ab68cc82d0b68e104074c2c161b170","bytes":81356,"triangles":830,"batches":2,"geometryBytes":79680,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"refrigerator","file":"kitchenFridge.glb","originalFile":"furniture/Models/GLTF format/kitchenFridge.glb","sourceSha256":"8af4f4bbb1b5525ad8226e97926a5af60fa8fb20a3cb74dbda5328a9d320dbab","sha256":"69be9a8c3d3a804c494b92220710c61a2f87a4c3600922d0da3d5020eb3aef4c","bytes":25668,"triangles":250,"batches":2,"geometryBytes":24000,"size":[0.4300000071525574,0.9200000166893005,0.29193389415740967],"radius":0.2598679494998898},{"icon":"sink","file":"kitchenSink.glb","originalFile":"furniture/Models/GLTF format/kitchenSink.glb","sourceSha256":"7b9610277d71f00dcf1bba49cf4d98d77ce5177e84bf76c7da2f8893e542f743","sha256":"7063bb1597aae39279a3430952338d6f72fe8bccba5b93b143b930ba992f3878","bytes":32196,"triangles":318,"batches":2,"geometryBytes":30528,"size":[0.4300000071525574,0.4899999797344208,0.44999998807907104],"radius":0.3112073245532484},{"icon":"toilet","file":"toilet.glb","originalFile":"furniture/Models/GLTF format/toilet.glb","sourceSha256":"16165cfd03c56c2cb443b800570810a22ef770f65e7a468f6761d9dc14eaaeae","sha256":"42fcec7b0b225b544dcf05bde35f17e598cdf01c8f5f15f36aa55c76ab91652f","bytes":23732,"triangles":230,"batches":2,"geometryBytes":22080,"size":[0.31255000829696655,0.450965017080307,0.4771767109632492],"radius":0.2827908769988002},{"icon":"bathtub","file":"bathtub.glb","originalFile":"furniture/Models/GLTF format/bathtub.glb","sourceSha256":"54c405c7035aab63dc41e709dc3c50fc5bcfbc4cddc91ffc54188075a6d25d01","sha256":"f15e3a3316060b4ddca2dd1350109adc26bc11f1a4784e8dcb23465ccdb3cb5a","bytes":59480,"triangles":602,"batches":2,"geometryBytes":57792,"size":[0.5600000023841858,0.41999998688697815,1.190000057220459],"radius":0.6478308291120068},{"icon":"potted-plant","file":"pottedPlant.glb","originalFile":"furniture/Models/GLTF format/pottedPlant.glb","sourceSha256":"5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15","sha256":"d6be69190662ff9b0388b7332f9a8d8e0530d1373b5a3c08deea336ea09613e7","bytes":7420,"triangles":60,"batches":2,"geometryBytes":5760,"size":[0.21205927431583405,0.6540167927742004,0.24146194756031036],"radius":0.12073097378015518},{"icon":"light","file":"lampRoundFloor.glb","originalFile":"furniture/Models/GLTF format/lampRoundFloor.glb","sourceSha256":"50fe1b5b588edf15bfa9cc880f71a02a4fda6036350b24733d0ef4de5cc5e908","sha256":"f663a0f42fc9277cfc365f4ccc335fe8a80d621159dae74922dd8c3947fd2b36","bytes":8956,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.15203941613435745,0.8600000143051147,0.17555999755859375],"radius":0.08778000315811903},{"icon":"statue","file":"statue_ring.glb","originalFile":"nature/Models/GLTF format/statue_ring.glb","sourceSha256":"5c62e4165f7a76436faa0b20e98b47d0a9e5021dcbf2a0eef0cdf0912180f02c","sha256":"013b58818fbebae606f6cb9b5bc7f769ac6f55dbf5bc1c486787078a8761d29c","bytes":8976,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.6000000238418579,0.7964101441204547,0.4000000059604645],"radius":0.3605551391183468},{"icon":"chest","file":"chest.glb","originalFile":"survival/Models/GLB format/chest.glb","sourceSha256":"84b03023e425cc1f96c6d0b0f352608be9e8e01b112790e6b00b8651bf84379b","sha256":"dfaf5cf144a7465e313e87d08eb82b0039202500256a6e89f774d0a1e9c35946","bytes":32580,"triangles":322,"batches":2,"geometryBytes":30912,"size":[0.2603999972343445,0.2571914792060852,0.2720249891281128],"radius":0.18828552338788324},{"icon":"barrel","file":"barrel.glb","originalFile":"survival/Models/GLB format/barrel.glb","sourceSha256":"3a0d12f6bdd1badd361f64ce0fbbf878a4ccfc2de8ff1ac4ed4c1aea2a9ee04a","sha256":"3b1f6cdf0e406cdf9630649a1eca8bdf8428a9f07d794bafd70406e63dafa6e3","bytes":41228,"triangles":412,"batches":2,"geometryBytes":39552,"size":[0.23649999499320984,0.3440000116825104,0.23649999499320984],"radius":0.13364122923364707},{"icon":"tent","file":"tent-canvas.glb","originalFile":"survival/Models/GLB format/tent-canvas.glb","sourceSha256":"efc4bca46a22e4cc4fe391aeafba161c24bc39bfa75e192c57eaacaf686f9717","sha256":"8baaab74d57cfa38d73963dccd6fe711006d28ebef0145a410494625f4cc0b9d","bytes":15868,"triangles":148,"batches":2,"geometryBytes":14208,"size":[0.5607622265815735,0.4913683533668518,0.5610000491142273],"radius":0.37933337775768333},{"icon":"car","file":"sedan.glb","originalFile":"car/Models/GLB format/sedan.glb","sourceSha256":"b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7","sha256":"99b2d9141e842d542c406b83a3f8701519cad9f5a4f4d046b7b0d6f8cf12c0f8","bytes":197452,"triangles":2032,"batches":3,"geometryBytes":195072,"size":[1.5,1.2999999523162844,2.549999952316284],"radius":1.3472214803586575}]'), us = new Map(fs.map((e) => [e.icon, {
  size: new E().fromArray(e.size),
  radius: e.radius
}])), Fe = {
  table: [1.2, 3],
  chair: [0.75, 1.35],
  bed: [0.4, 0.85],
  shelf: [1, 8],
  tree: [0.6, 1.7],
  rock: [0.6, 1.7],
  stool: [0.8, 1.4],
  bench: [1.5, 3.2],
  sofa: [1.6, 3.4],
  cabinet: [0.7, 1.4],
  chest: [0.7, 1.4],
  barrel: [0.8, 1.25],
  stove: [0.75, 1.3],
  refrigerator: [1, 1.85],
  sink: [0.75, 1.3],
  toilet: [0.45, 0.9],
  bathtub: [0.32, 0.65],
  car: [0.4, 0.8],
  statue: [1, 2],
  tent: [0.75, 1.35],
  "potted-plant": [0.65, 1.3],
  light: [0.65, 1.3]
}, ps = /* @__PURE__ */ new Set([
  "tree",
  "rock",
  "stool",
  "barrel",
  "potted-plant",
  "light"
]), ms = {
  tree: "forest",
  rock: "stone",
  sofa: "fabric",
  cabinet: "wood",
  chest: "wood",
  barrel: "wood",
  stove: "metal",
  refrigerator: "metal",
  sink: "tile",
  toilet: "tile",
  bathtub: "tile",
  car: "metal",
  statue: "stone",
  tent: "fabric",
  "potted-plant": "tile",
  light: "metal"
};
function Ve(e) {
  if (se(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(Fe, e.icon)) return;
  const s = e.icon;
  if (e.shape === "circle") return ps.has(s) ? s : void 0;
  if (e.shape !== "rect") return;
  const { width: t, height: a } = Ne(e), n = t / a, [i, o] = Fe[s];
  return n >= i && n <= o ? s : void 0;
}
function qe(e, s, { size: t, radius: a }, n, i) {
  const o = s === "shelf" ? Math.max(1, Math.ceil(n / i / (t.x / t.z))) : 1, r = Math.min((s === "tree" ? 3 : 2.5) / t.y, e.shape === "circle" ? n / (2 * a) : Math.min(n / o / t.x, i / t.z));
  return {
    count: o,
    scale: r,
    height: t.y * r
  };
}
function bs(e, s, t, a) {
  return qe(e, s, us.get(s), t, a).height;
}
function gs(e, s, t, a, n, i, o, r) {
  const { size: l } = a, { count: f, scale: h, height: c } = qe(s, t, a, n, i), p = s.material ? s : {
    ...s,
    material: ms[t] || "unknown"
  };
  for (const b of a.parts) {
    const g = o.own(b.geometry.clone());
    if (g.scale(h, h, h), t === "table") {
      const m = g.getAttribute("position"), w = l.x * h / 2, x = n / 2 - w;
      for (let u = 0; u < m.count; u++) {
        if (m.getY(u) < l.y * h * 0.55) continue;
        const O = m.getX(u);
        m.setX(u, O + Math.max(-1, Math.min(1, O / (w * 0.5))) * x);
      }
      g.computeVertexNormals();
    }
    g.computeBoundingBox(), g.computeBoundingSphere();
    let y = p;
    b.role === "soft" || b.role === "shade" ? y = {
      ...s,
      material: "bed-sheet"
    } : b.role === "foliage" ? y = {
      ...s,
      material: "forest"
    } : b.role === "window" ? y = {
      ...s,
      material: "glass"
    } : b.role === "wood" ? y = {
      ...s,
      material: "wood"
    } : b.role === "bark" && (!s.material || ["grass", "forest"].includes(s.material)) && (y = {
      ...s,
      material: "wood"
    });
    const P = b.role === "detail" ? t === "car" ? -0.78 : -0.25 : b.role === "bark" ? -0.22 : b.role === "window" ? -0.3 : b.role === "soft" ? 0.12 : 0, M = t === "light" && b.role === "shade" ? r.lampShade(s, P) : r.mesh(y, P), _ = o.own(new J(g, M, f));
    for (let m = 0; m < f; m++) _.setMatrixAt(m, new q().makeTranslation((m - (f - 1) / 2) * l.x * h, 0, 0));
    const d = t === "light" && b.role === "shade" && M.emissiveIntensity > 0 && M.emissive.getHex() !== 0;
    _.castShadow = M.opacity >= 0.8 && !d, _.receiveShadow = !0, e.add(_);
  }
  return c;
}
function ys(e, s, t, a, n, i) {
  const o = Xe(s, t), r = [], l = Math.max(0.45, o.reduce((c, p) => c + p.length, 0) / 128);
  let f = 0;
  for (const c of o) {
    for (const p of [0.22, 0.5]) r.push(new q().makeRotationY(c.rotation).scale(new E(c.length, 0.045, 0.04)).setPosition(c.x, p, c.z));
    for (; f <= c.length; ) {
      const p = f - c.length / 2;
      r.push(new q().makeScale(0.065, 0.58, 0.065).setPosition(c.x + Math.cos(c.rotation) * p, 0.29, c.z - Math.sin(c.rotation) * p)), f += l;
    }
    f -= c.length;
  }
  if (!t && s.length) {
    const c = s.at(-1);
    r.push(new q().makeScale(0.065, 0.58, 0.065).setPosition(c.x, 0.29, c.y));
  }
  const h = i.own(new J(a, n, r.length));
  return r.forEach((c, p) => h.setMatrixAt(p, c)), h.castShadow = n.opacity >= 0.8, h.receiveShadow = !0, e.add(h), 0.58;
}
function _e(e, s, t = 10) {
  const a = [], n = [], i = [], o = new E(0, 1, 0);
  e.forEach((l, f) => {
    const h = e[Math.min(f + 1, e.length - 1)].clone().sub(e[Math.max(0, f - 1)]).normalize(), c = new E().crossVectors(h, Math.abs(h.y) > 0.95 ? new E(1, 0, 0) : o).normalize(), p = new E().crossVectors(h, c).normalize(), b = f / (e.length - 1), g = s(b);
    for (let y = 0; y <= t; y++) {
      const P = y / t * Math.PI * 2, M = l.clone().addScaledVector(c, Math.cos(P) * g).addScaledVector(p, Math.sin(P) * g);
      if (a.push(M.x, M.y, M.z), i.push(y / t, b), f && y < t) {
        const _ = (f - 1) * (t + 1) + y, d = f * (t + 1) + y;
        n.push(_, d, _ + 1, d, d + 1, _ + 1);
      }
    }
  });
  for (const l of [0, e.length - 1]) {
    const f = a.length / 3, h = e[l], c = l * (t + 1);
    a.push(h.x, h.y, h.z), i.push(0.5, l ? 1 : 0);
    for (let p = 0; p < t; p++) n.push(f, c + p + (l ? 0 : 1), c + p + (l ? 1 : 0));
  }
  const r = new de();
  return r.setAttribute("position", new ce(a, 3)), r.setAttribute("uv", new ce(i, 2)), r.setIndex(n), r.computeVertexNormals(), r;
}
function ws(e, s, t, a, n) {
  const i = s.icon, o = Ue(s), r = t.filter((y, P) => !P || !y.equals(t[P - 1]));
  if (r.length < 2) return 0;
  const l = [0];
  for (let y = 1; y < r.length; y++) l.push(l[y - 1] + r[y].distanceTo(r[y - 1]));
  const f = l[l.length - 1], h = Math.min(i === "tentacle" ? 0.22 : 0.09, Math.max(0.025, f * 0.035)), c = (y) => i === "pipe" ? h : h * (0.08 + 0.92 * (1 - y) ** 0.7), p = r.map((y, P) => c(P / (r.length - 1))), b = r.map((y, P) => {
    const M = P / (r.length - 1);
    return new E(y.x, p[P] + (i === "tentacle" ? Math.sin(M * Math.PI) * h * 1.6 : 0), y.y);
  }), g = new Y(a.own(_e(b, c)), n.mesh({
    ...s,
    material: o
  }));
  if (g.castShadow = g.receiveShadow = !0, e.add(g), i === "vine" || i === "tentacle") {
    const y = Math.min(24, Math.max(2, Math.floor(f * 3))), P = a.own(new Me(1, 8, 6)), M = a.own(new J(P, n.mesh({
      ...s,
      material: o
    }, i === "vine" ? 0.12 : 0.3), y));
    let _ = 0;
    for (let d = 0; d < y; d++) {
      const m = (d + 0.5) / y * f;
      for (; _ < r.length - 2 && l[_ + 1] < m; ) _++;
      const w = (m - l[_]) / (l[_ + 1] - l[_]), x = b[_].clone().lerp(b[_ + 1], w), u = p[_] + (p[_ + 1] - p[_]) * w, O = d % 2 ? -1 : 1, z = r[_ + 1].clone().sub(r[_]).normalize();
      x.add(new E(z.y, 0, -z.x).multiplyScalar(i === "vine" ? O * u * 1.2 : 0)), x.y += u * 0.65;
      const j = new we().setFromAxisAngle(new E(0, 1, 0), Math.atan2(z.x, z.y) + O * 0.75), B = i === "vine" ? new E(u * 2.1, u * 0.3, u * 0.8) : new E(u * 0.5, u * 0.28, u * 0.55);
      M.setMatrixAt(d, new q().compose(x, j, B));
    }
    M.castShadow = M.receiveShadow = !0, e.add(M);
  }
  return Math.max(...b.map((y) => y.y)) + h;
}
function _s(e, s) {
  const t = e.own(new Me(1, 20, 14)), a = e.own(new Ye(1, 1, 6)), n = e.own(new ve(1, 1, 1, 12)), i = e.own(new Be(1, 0)), o = /* @__PURE__ */ new Map();
  return (r, l, f, h) => {
    const c = l.icon, p = Ue(l), b = `${c}:${p}:${l.certainty}:${l.category}`;
    if (!o.has(b)) {
      let x = function(A, k, S, F, N, L, D, R = 0, I = p) {
        const U = new Y(A, s.mesh({
          ...l,
          material: I
        }, R));
        return U.position.set(k, S, F), U.scale.set(N, L, D), U.castShadow = U.material.opacity >= 0.8, U.receiveShadow = !0, w.add(U), U;
      }, u = function(A, k, S, F) {
        for (const N of [-1, 1]) x(t, N * A, k, S, F, F * 1.4, F * 0.65, -0.92, "stone");
      };
      const w = new me();
      if (c === "slime")
        x(t, 0, 0.25, 0, 0.47, 0.25, 0.45), x(t, -0.04, 0.48, -0.03, 0.34, 0.38, 0.33, 0.06), u(0.105, 0.49, 0.29, 0.028);
      else if (c === "mushroom") {
        x(n, 0, 0.34, 0, 0.105, 0.68, 0.1, 0.25, "wood"), x(t, 0, 0.65, 0, 0.5, 0.22, 0.48), x(t, 0, 0.6, 0, 0.46, 0.04, 0.44, 0.45, "fabric");
        for (const [A, k, S] of [
          [
            -0.18,
            -0.08,
            0.06
          ],
          [
            0.18,
            0.14,
            0.055
          ],
          [
            0.08,
            -0.26,
            0.045
          ],
          [
            -0.25,
            0.19,
            0.04
          ]
        ]) x(t, A, 0.82 - (A * A + k * k) * 0.48, k, S, 0.022, S, 0.65);
      } else if (c === "crystal")
        x(i, 0, 0.62, 0, 0.23, 0.64, 0.24, 0.05).rotation.z = -0.12, x(i, -0.28, 0.3, 0.14, 0.13, 0.38, 0.15, -0.13).rotation.z = 0.3, x(i, 0.27, 0.26, -0.05, 0.15, 0.34, 0.17, 0.12).rotation.z = -0.36;
      else if (c === "dragon") {
        x(t, 0, 0.35, 0.02, 0.16, 0.22, 0.28), x(t, 0, 0.62, 0.22, 0.095, 0.24, 0.11, 0.04).rotation.x = -0.3, x(t, 0, 0.84, 0.3, 0.12, 0.11, 0.18, 0.12), x(t, 0, 0.79, 0.41, 0.085, 0.05, 0.13, 0.2);
        for (const k of [-1, 1]) {
          for (const R of [-0.13, 0.21]) x(t, k * 0.15, 0.15, R, 0.065, 0.16, 0.065, -0.08);
          x(a, k * 0.08, 0.99, 0.23, 0.035, 0.2, 0.045, 0.35, "wood").rotation.z = -k * 0.3;
          const S = [
            new E(k * 0.1, 0.46, -0.06),
            new E(k * 0.26, 0.7, -0.24),
            new E(k * 0.47, 0.85, -0.26)
          ], F = new Y(e.own(_e(S, (R) => 0.022 * (1 - R * 0.8), 6)), s.mesh({
            ...l,
            material: p
          }, 0.2));
          w.add(F);
          const N = e.own(new de()), L = [
            [
              0.1,
              0.46,
              -0.06
            ],
            [
              0.26,
              0.7,
              -0.24
            ],
            [
              0.47,
              0.85,
              -0.26
            ],
            [
              0.4,
              0.48,
              -0.12
            ],
            [
              0.34,
              0.35,
              0.13
            ],
            [
              0.24,
              0.41,
              0.03
            ],
            [
              0.16,
              0.32,
              0.21
            ]
          ];
          N.setAttribute("position", new ce(L.flatMap(([R, I, U]) => [
            k * R,
            I,
            U
          ]), 3)), N.setAttribute("uv", new ce(L.flatMap(([R, , I]) => [R, I]), 2)), N.setIndex([
            0,
            1,
            2,
            0,
            2,
            3,
            0,
            3,
            4,
            0,
            4,
            5,
            0,
            5,
            6
          ]), N.computeVertexNormals();
          const D = new Y(N, s.mesh({
            ...l,
            material: p
          }, -0.18));
          D.castShadow = D.receiveShadow = !0, w.add(D);
        }
        const A = e.own(_e([
          new E(0, 0.27, -0.16),
          new E(0.12, 0.13, -0.3),
          new E(0.29, 0.08, -0.42),
          new E(0.37, 0.04, -0.33)
        ], (k) => 0.09 * (1 - k) + 5e-3));
        w.add(new Y(A, s.mesh({
          ...l,
          material: p
        }))), u(0.075, 0.87, 0.43, 0.016);
      } else {
        const A = c === "dwarf", k = A ? 0.3 : 0.19;
        x(a, 0, 0.46, 0, k, 0.66, k * 0.75, -0.04), x(t, 0, 0.89, 0, A ? 0.21 : 0.15, 0.21, 0.15, 0.38, "wood");
        for (const S of [-1, 1])
          x(n, S * k * 0.75, 0.14, 0.015, 0.055, 0.27, 0.07, -0.35, "wood"), x(t, S * k, 0.55, 0.015, 0.075, 0.23, 0.08, 0.06).rotation.z = S * 0.25;
        if (A)
          x(t, 0, 1.02, -5e-3, 0.225, 0.14, 0.18, 0.1, "metal"), x(a, 0, 0.71, 0.16, 0.18, 0.37, 0.12, -0.2, "wood").rotation.z = Math.PI, x(n, 0, 0.5, 0, 0.3, 0.07, 0.235, -0.25, "wood");
        else {
          for (const S of [-1, 1]) x(a, S * 0.19, 0.94, 0, 0.06, 0.23, 0.035, 0.38, "wood").rotation.z = -S * 1.1;
          x(t, 0, 1.02, -0.05, 0.17, 0.1, 0.15, -0.28, "wood");
        }
        u(0.06, 0.9, 0.135, 0.015);
      }
      w.updateMatrixWorld(!0);
      const O = /* @__PURE__ */ new Map();
      w.traverse((A) => {
        if (!(A instanceof Y)) return;
        const k = A.material, S = A.geometry.index ? A.geometry.toNonIndexed() : A.geometry.clone();
        S.applyMatrix4(A.matrixWorld), O.has(k) || O.set(k, []), O.get(k).push(S);
      }), w.clear();
      for (const [A, k] of O) {
        let S;
        try {
          S = Ut(k);
        } finally {
          k.forEach((N) => N.dispose());
        }
        if (!S) throw new Error("map_sculpture_geometry_invalid");
        const F = new Y(e.own(S), A);
        F.castShadow = A.opacity >= 0.8, F.receiveShadow = !0, w.add(F);
      }
      const z = new te().setFromObject(w), j = z.getCenter(new E());
      let B = 0;
      w.traverse((A) => {
        if (!(A instanceof Y)) return;
        const k = A.geometry.getAttribute("position");
        for (let S = 0; S < k.count; S++) {
          const F = new E().fromBufferAttribute(k, S).sub(j);
          B = Math.max(B, Math.hypot(F.x, F.z));
        }
      }), o.set(b, {
        group: w,
        box: z,
        radius: B
      });
    }
    const g = o.get(b), y = g.group.clone(!0), { box: P, radius: M } = g, _ = P.getSize(new E()), d = P.getCenter(new E()), m = Math.min(f / _.x, h / _.z, 2.8 / _.y, l.shape === "circle" ? f / (2 * M) : 1 / 0);
    return y.scale.setScalar(m), y.position.set(-d.x * m, -P.min.y * m, -d.z * m), r.add(y), _.y * m;
  };
}
function xs(e) {
  const t = new Uint8Array(9216);
  for (let r = 0; r < 48; r++) for (let l = 0; l < 48; l++) {
    const f = Math.hypot((l + 0.5) / 48 * 2 - 1, (r + 0.5) / 48 * 2 - 1);
    t[(r * 48 + l) * 4 + 3] = Math.round(Math.max(0, 1 - f) ** 1.5 * 120);
  }
  const a = e.own(new Ee(t, 48, 48, Pe));
  a.magFilter = a.minFilter = Se, a.needsUpdate = !0;
  const n = e.own(new kt(0.5, 32).rotateX(-Math.PI / 2)), i = /* @__PURE__ */ new Map();
  let o = 0;
  return (r, l, f, h) => {
    if (o++ >= 96) return;
    i.has(h) || i.set(h, e.own(new Ft({
      map: a,
      transparent: !0,
      opacity: h,
      depthWrite: !1,
      toneMapped: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1
    })));
    const c = new Y(n, i.get(h));
    c.scale.set(l, 1, f), c.position.y = 0.019, r.add(c);
  };
}
function Ms(e, s) {
  let t = !1;
  for (let a = 0, n = s.length - 1; a < s.length; n = a++) {
    const i = s[a], o = s[n];
    i.y > e.y != o.y > e.y && e.x < (o.x - i.x) * (e.y - i.y) / (o.y - i.y) + i.x && (t = !t);
  }
  return t;
}
function Ss(e, s, t, a = ts(e)) {
  const n = new $e(), i = new me();
  try {
    const o = ls(n, s, e.lighting), r = ds(n, o), l = _s(n, o), f = xs(n), h = n.own(new Ke(1, 1, 1)), c = n.own(new Be(0.5, 1)), p = n.own(new ve(0.055, 0.08, 1, 6)), b = lt(e.elements), g = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), P = [], M = new te();
    for (const [d, m] of mt(e.elements).entries()) {
      const w = ss(m, a.scale), x = new me();
      let u = 0.015, O = !1;
      const z = es(m), j = dt(m), B = bt(m), A = Ve(m), k = A && t?.get(A), S = m.icon === "fence" && ["path", "curve"].includes(m.shape) && !se(m) && !["wall", "grid"].includes(m.category), F = !z && !se(m) && Te(m) && (ft(m) || ["furniture", "decoration"].includes(m.category));
      if (m.shape === "icon" || m.shape === "label") u = 0.08;
      else if (m.category === "wall") {
        u = 1.1;
        const L = Xe(w.points, w.closed), D = n.own(new J(h, o.mesh(m, 0.12), L.length));
        D.castShadow = D.receiveShadow = !0, x.add(D), L.forEach((R, I) => {
          const U = new q().makeRotationY(R.rotation).scale(new E(R.length, u, 0.08)).setPosition(R.x, u / 2, R.z);
          D.setMatrixAt(I, U);
        }), P.push(D);
      } else if (S) u = ys(x, w.points, w.closed, h, o.mesh(m), n);
      else if (B) u = ws(x, m, w.points, n, o);
      else if (j) u = l(x, m, w.width, w.depth);
      else if (A && k) u = gs(x, m, A, k, w.width, w.depth, n, o);
      else if (z) u = r(x, m, z, w.width, w.depth);
      else if (Te(m)) {
        u = F ? 0.2 : 0.015;
        const L = m.category === "terrain" ? 0.14 : u, D = n.own(os(w.points, L));
        D.translate(0, u - L, 0);
        const R = new Y(D, m.category === "terrain" && !F ? o.ground(m) : o.mesh(m));
        R.castShadow = u > 0.1, R.receiveShadow = !0, x.add(R);
      } else if (m.category === "road" || m.category === "water") {
        const L = new Y(n.own(is(w.points, w.closed, m.category === "road" ? 0.16 : 0.08).translate(0, u, 0)), o.mesh(m));
        L.receiveShadow = !0, x.add(L);
      }
      if (z || k || j) {
        const L = new te().setFromObject(x), D = Math.max(w.width, w.depth) * 1e-6;
        O = L.min.x > -w.width / 2 + D || L.max.x < w.width / 2 - D || L.min.z > -w.depth / 2 + D || L.max.z < w.depth / 2 - D;
      }
      if ((z || k || j) && w.width > 0 && w.depth > 0 && f(x, w.width, w.depth, he(m, "").opacity), w.points.length && !B && (O || !z && !k && !j)) {
        const L = new St(n.own(as(w.points, w.closed, O ? 0.019 : m.category === "wall" ? 0.012 : u + 4e-3)), o.line(m));
        L.computeLineDistances(), x.add(L);
      }
      const N = (b.get(m.id) || []).flatMap((L) => {
        const D = new Z((L.x - w.center[0]) / a.scale, (L.y - w.center[1]) / a.scale), R = L.size / a.scale / 2;
        return Array.from({ length: 8 }, (I, U) => new Z(D.x + R * Math.cos(U * Math.PI / 4), D.y + R * Math.sin(U * Math.PI / 4))).every((I) => Ms(I, w.points)) ? [{
          center: D,
          radius: R
        }] : [];
      });
      if (N.length) {
        const L = new J(c, o.mesh(m, -0.03), N.length * 3), D = n.own(new J(p, o.mesh({
          ...m,
          material: "wood"
        }, -0.25), N.length));
        N.forEach(({ center: R, radius: I }, U) => {
          const K = I * 1.6;
          D.setMatrixAt(U, new q().makeScale(I, K, I).setPosition(R.x, K / 2 + u, R.y));
          for (let X = 0; X < 3; X++) {
            const oe = U * 3 + X, ae = X === 0 ? 1.55 : 1.1;
            L.setMatrixAt(oe, new q().makeRotationY(U * 2.4 + X).scale(new E(I * ae, I * ae * 0.9, I * ae)).setPosition(R.x + (X === 1 ? -0.3 : X === 2 ? 0.3 : 0) * I, u + I * (X === 0 ? 1.8 : 1.35), R.y)), L.setColorAt(oe, new ye().setScalar(0.84 + U % 5 * 0.03 + (X === 0 ? 0.08 : 0)));
          }
        }), L.castShadow = L.receiveShadow = !0, D.castShadow = D.receiveShadow = !0, n.own(L), x.add(D, L);
      }
      if (x.position.copy(a.point(...w.center, d * 2e-3)), x.rotation.y = w.rotation, i.add(x), A) {
        const L = bs(m, A, w.width, w.depth) + 0.1;
        x.updateMatrix(), M.union(new te(new E(-w.width / 2, 0, -w.depth / 2), new E(w.width / 2, L, w.depth / 2)).applyMatrix4(x.matrix));
      }
      se(m) ? (g.set(m.id, a.point(...w.center, x.position.y + 0.025)), j && y.set(m.id, a.point(...w.center, x.position.y + u + 0.06))) : z || A || F || j ? g.set(m.id, a.point(...w.center, x.position.y + u + 0.1)) : g.set(m.id, a.point(...ht(m, 0), x.position.y + (S || B ? u : 0) + 0.1));
    }
    const _ = new te().setFromObject(i).union(M);
    for (const d of g.values()) _.expandByPoint(d);
    for (const d of y.values()) _.expandByPoint(d);
    return {
      group: i,
      anchors: g,
      markerTops: y,
      bounds: _,
      frame: a,
      updateWalls(d) {
        for (const m of P) m.scale.y = d ? 0.2 / 1.1 : 1;
      },
      dispose() {
        i.removeFromParent(), n.dispose(), i.clear();
      }
    };
  } catch (o) {
    throw n.dispose(), i.clear(), o;
  }
}
var je = (e, s) => e.x < s.x + s.w + 3 && e.x + e.w + 3 > s.x && e.y < s.y + s.h + 3 && e.y + e.h + 3 > s.y;
function vs(e, s, t, a = []) {
  const n = /* @__PURE__ */ new Map(), i = [...e].sort((h, c) => h.priority - c.priority || h.id.localeCompare(c.id)), o = [...a], r = i.filter((h) => h.badge).map(({ anchor: h }) => ({
    x: h.x - 3,
    y: h.y - 3,
    w: 6,
    h: 6
  })), l = (h) => h.x >= 3 && h.y >= 3 && h.x + h.w <= s - 3 && h.y + h.h <= t - 3, f = (h) => l(h) && !o.some((c) => je(h, c)) && !r.some((c) => je(h, c));
  for (const h of i) {
    const c = { anchor: { ...h.anchor } };
    if (n.set(h.id, c), !h.badge) continue;
    const { w: p, h: b } = h.badge, { x: g, y } = h.badgeAnchor || h.anchor, P = [];
    for (const _ of [
      9,
      27,
      45
    ]) P.push({
      x: g - p / 2,
      y: y - b - _,
      w: p,
      h: b
    }, {
      x: g + _,
      y: y - b / 2,
      w: p,
      h: b
    }, {
      x: g - p - _,
      y: y - b / 2,
      w: p,
      h: b
    }, {
      x: g - p / 2,
      y: y + _,
      w: p,
      h: b
    });
    const M = P.map((_) => ({
      x: Math.max(3, Math.min(s - p - 3, _.x)),
      y: Math.max(3, Math.min(t - b - 3, _.y)),
      w: p,
      h: b
    }));
    c.badge = M.find(f) || M[0], o.push(c.badge);
  }
  for (const h of i) {
    if (!h.caption) continue;
    const c = n.get(h.id), { w: p, h: b } = h.caption, g = c.badge || {
      ...h.anchor,
      w: 0,
      h: 0
    };
    c.caption = [
      {
        x: g.x + (g.w - p) / 2,
        y: g.y - b - 5,
        w: p,
        h: b
      },
      {
        x: g.x + g.w + 6,
        y: g.y + (g.h - b) / 2,
        w: p,
        h: b
      },
      {
        x: g.x - p - 6,
        y: g.y + (g.h - b) / 2,
        w: p,
        h: b
      },
      {
        x: g.x + (g.w - p) / 2,
        y: g.y + g.h + 5,
        w: p,
        h: b
      }
    ].find(f), c.caption && o.push(c.caption);
  }
  return n;
}
function Es(e, s, t, a) {
  const n = s.elements.filter((i) => i.label || se(i)).map((i) => {
    const o = se(i) && i.shape !== "label", r = i.actorKey === "player", l = r ? 0 : i.category === "door" ? 1 : i.category === "actor" ? 2 : o ? 3 : 4, f = i.label || rt[i.category], h = document.createElement("span");
    h.className = `map-3d-label is-${i.category}${r ? " is-player" : ""}`, h.dataset.element = i.id, h.style.zIndex = String(10 - l), o && (h.setAttribute("role", "img"), h.setAttribute("aria-label", f));
    const c = he(i, "");
    h.style.opacity = String(c.opacity);
    const p = document.createElement("span");
    p.className = "map-3d-glyph", p.setAttribute("aria-hidden", "true");
    const b = document.createElement("span");
    b.className = "map-3d-anchor", b.setAttribute("aria-hidden", "true");
    const g = document.createElement("span");
    g.className = "map-3d-leader", g.setAttribute("aria-hidden", "true"), o && h.append(g, b, p);
    const y = document.createElement("span");
    return y.textContent = f, y.className = "map-3d-label-text", o && y.setAttribute("aria-hidden", "true"), h.append(y), e.append(h), {
      element: i,
      node: h,
      glyph: p,
      dot: b,
      leader: g,
      caption: y,
      recipe: c,
      hasGlyph: o,
      priority: l,
      anchor: t.get(i.id)
    };
  });
  return {
    symbols(i) {
      for (const o of n) {
        const r = wt(o.element.icon);
        if (r) {
          const l = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          l.setAttribute("viewBox", "0 0 24 24"), l.setAttribute("aria-hidden", "true");
          const f = document.createElementNS(l.namespaceURI, "path");
          f.setAttribute("d", r.path), f.setAttribute("fill", "currentColor"), f.setAttribute("fill-opacity", ".35"), f.setAttribute("stroke", "currentColor"), f.setAttribute("stroke-width", "1.2"), f.setAttribute("stroke-linejoin", "round"), l.append(f), o.glyph.replaceChildren(l);
          continue;
        }
        o.glyph.textContent = i ? o.recipe.icon : o.recipe.fallback, o.glyph.classList.toggle("has-symbols", i);
      }
    },
    update(i, o, r, l) {
      const f = [];
      for (const { element: b, node: g, caption: y, glyph: P, anchor: M, hasGlyph: _, priority: d } of n) {
        g.style.visibility = "hidden", y.hidden = !l;
        const m = M.clone().project(i), w = (m.x + 1) * o / 2, x = (1 - m.y) * r / 2, u = a?.get(b.id)?.clone().project(i);
        m.z < -1 || m.z > 1 || w < 0 || w > o || x < 0 || x > r || f.push({
          id: b.id,
          anchor: {
            x: w,
            y: x
          },
          priority: d,
          badgeAnchor: u ? {
            x: (u.x + 1) * o / 2,
            y: (1 - u.y) * r / 2
          } : void 0,
          badge: _ ? {
            w: P.offsetWidth,
            h: P.offsetHeight
          } : void 0,
          caption: l ? {
            w: y.offsetWidth,
            h: y.offsetHeight
          } : void 0
        });
      }
      const h = e.parentElement?.querySelector(".map-viewport-controls")?.getBoundingClientRect(), c = e.getBoundingClientRect(), p = vs(f, o, r, h ? [{
        x: h.x - c.x,
        y: h.y - c.y,
        w: h.width,
        h: h.height
      }] : []);
      for (const { element: b, node: g, caption: y, dot: P, leader: M } of n) {
        const _ = p.get(b.id), d = _?.badge || _?.caption;
        if (y.style.visibility = _?.caption ? "inherit" : "hidden", !(!_ || !d) && (g.style.visibility = "visible", g.style.transform = `translate(${d.x}px, ${d.y}px)`, g.style.width = `${d.w}px`, g.style.height = `${d.h}px`, _.caption && (y.style.left = `${_.caption.x - d.x}px`, y.style.top = `${_.caption.y - d.y}px`), _.badge)) {
          const m = _.anchor.x - d.x, w = _.anchor.y - d.y;
          P.style.transform = `translate(${m}px, ${w}px)`;
          const x = Math.max(0, Math.min(d.w, m)), u = Math.max(0, Math.min(d.h, w));
          M.style.width = `${Math.hypot(x - m, u - w)}px`, M.style.transform = `translate(${m}px, ${w}px) rotate(${Math.atan2(u - w, x - m)}rad)`;
        }
      }
    },
    dispose() {
      for (const { node: i } of n) i.remove();
    }
  };
}
async function Ps(e) {
  const { scene: s } = await new Nt().parseAsync(e, ""), t = new $e(), a = [], n = new te().setFromObject(s).getSize(new E());
  let i = 0;
  return s.traverse((o) => {
    if (!(o instanceof Y)) return;
    t.own(o.geometry);
    const r = Array.isArray(o.material) ? o.material : [o.material];
    r.forEach((f) => t.own(f)), a.push({
      geometry: o.geometry,
      role: r[0].name
    });
    const l = o.geometry.getAttribute("position");
    for (let f = 0; f < l.count; f++) i = Math.max(i, Math.hypot(l.getX(f), l.getZ(f)));
  }), {
    parts: a,
    size: n,
    radius: i,
    dispose: () => {
      t.dispose(), s.clear();
    }
  };
}
function ks(e, s, t) {
  const a = /* @__PURE__ */ new Map();
  let n = !1, i = !1;
  function o() {
    n || !i || [...a.values()].some((l) => !l.settled) || (i = !1, s());
  }
  function r(l) {
    const f = a.get(l);
    a.delete(l), f?.abort.abort(), f?.asset?.dispose();
  }
  return {
    get: (l) => a.get(l)?.asset,
    sync(l) {
      if (n) return;
      const f = new Set(l);
      for (const h of a.keys()) f.has(h) || r(h);
      for (const h of f) {
        if (a.has(h)) continue;
        const c = {
          abort: new AbortController(),
          settled: !1,
          asset: void 0
        };
        a.set(h, c), e(h, c.abort.signal).then((p) => {
          if (a.get(h) !== c) {
            p.dispose();
            return;
          }
          c.asset = p, c.settled = !0, i = !0, o();
        }, (p) => {
          c.settled = !0, a.get(h) === c && t(h, p), o();
        });
      }
      o();
    },
    dispose() {
      n = !0;
      for (const l of a.keys()) r(l);
    }
  };
}
var As = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/table.glb?v=07cd3bfb1f6884b7",
  import.meta.url
).href, Ts = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/chairRounded.glb?v=f62c6c7e655f8360",
  import.meta.url
).href, Ls = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/bedSingle.glb?v=b89c28f9ad8e77dd",
  import.meta.url
).href, Rs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/bookcaseOpenLow.glb?v=c67a8d18cd802afb",
  import.meta.url
).href, Ds = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/tree_oak.glb?v=adb24a59f159f214",
  import.meta.url
).href, zs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/stone_largeE.glb?v=07185b2e5f8ce40f",
  import.meta.url
).href, Os = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/stoolBar.glb?v=6fe6e654458f50ab",
  import.meta.url
).href, Cs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/bench.glb?v=21bd02dce1f980af",
  import.meta.url
).href, Fs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/loungeSofa.glb?v=a4a0b16aa48731b6",
  import.meta.url
).href, js = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/kitchenCabinet.glb?v=0f9b3693f3de853f",
  import.meta.url
).href, Us = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/chest.glb?v=dfaf5cf144a7465e",
  import.meta.url
).href, Ns = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/barrel.glb?v=3b1f6cdf0e406cdf",
  import.meta.url
).href, Is = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/kitchenStove.glb?v=6d1deee24fa30890",
  import.meta.url
).href, Bs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/kitchenFridge.glb?v=69be9a8c3d3a804c",
  import.meta.url
).href, Gs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/kitchenSink.glb?v=7063bb1597aae392",
  import.meta.url
).href, Ys = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/toilet.glb?v=42fcec7b0b225b54",
  import.meta.url
).href, Zs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/bathtub.glb?v=f15e3a3316060b4d",
  import.meta.url
).href, Ks = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/sedan.glb?v=99b2d9141e842d54",
  import.meta.url
).href, Hs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/statue_ring.glb?v=013b58818fbebae6",
  import.meta.url
).href, Ws = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/tent-canvas.glb?v=8baaab74d57cfa38",
  import.meta.url
).href, Xs = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/pottedPlant.glb?v=d6be69190662ff9b",
  import.meta.url
).href, $s = new URL(
  /* @vite-ignore */
  "../apps/map/ui/three/assets/kenney/lampRoundFloor.glb?v=f663a0f42fc9277c",
  import.meta.url
).href, Vs = {
  table: As,
  chair: Ts,
  bed: Ls,
  shelf: Rs,
  tree: Ds,
  rock: zs,
  stool: Os,
  bench: Cs,
  sofa: Fs,
  cabinet: js,
  chest: Us,
  barrel: Ns,
  stove: Is,
  refrigerator: Bs,
  sink: Gs,
  toilet: Ys,
  bathtub: Zs,
  car: Ks,
  statue: Hs,
  tent: Ws,
  "potted-plant": Xs,
  light: $s
};
function qs(e) {
  const s = pe(), t = new xt(s.sky.color, s.ground, s.sky.intensity), a = new Re(s.key.color, s.key.intensity), n = new Re(s.fill.color, s.fill.intensity), i = [];
  a.shadow.mapSize.set(1024, 1024), a.shadow.normalBias = 0.012, a.shadow.bias = -15e-5, a.shadow.radius = 2, e.add(t, a, a.target, n);
  function o() {
    const r = i.pop();
    r.removeFromParent(), r.dispose();
  }
  return {
    update(r, l, f, h) {
      const c = pe(r.lighting);
      t.color.set(c.sky.color), t.groundColor.set(c.ground), t.intensity = c.sky.intensity, a.color.set(c.key.color), a.intensity = c.key.intensity, a.castShadow = c.shadows, n.color.set(c.fill.color), n.intensity = c.fill.intensity;
      const p = f.getCenter(new E()), b = Math.max(1, f.getSize(new E()).length()), g = r.lighting ? new E(...ut) : new E(-0.5, 1, 0.5);
      a.position.copy(p).add(g.multiplyScalar(b)), a.target.position.copy(p), n.position.copy(p).add(new E(b, b / 2, -b)), a.updateMatrixWorld(!0), a.target.updateMatrixWorld(!0), a.shadow.updateMatrices(a);
      const y = f.clone().applyMatrix4(a.shadow.camera.matrixWorldInverse);
      Object.assign(a.shadow.camera, {
        left: y.min.x - 0.3,
        right: y.max.x + 0.3,
        top: y.max.y + 0.3,
        bottom: y.min.y - 0.3,
        near: Math.max(0.01, -y.max.z - 1),
        far: -y.min.z + 1
      }), a.shadow.camera.updateProjectionMatrix(), a.shadow.needsUpdate = !0;
      const P = pt(r);
      for (; i.length > P.length; ) o();
      P.forEach((M, _) => {
        let d = i[_];
        d || (d = new Ze(), i.push(d), e.add(d), d.shadow.mapSize.set(512, 512), d.shadow.normalBias = 0.025, d.shadow.bias = -2e-4, d.shadow.radius = 2, d.shadow.autoUpdate = !1);
        const m = M.radius / l.scale, w = M.overhead ? Math.max(2.2, m * 0.44) : Math.max(1, h.get(M.id)?.y || 0);
        d.color.set(M.color), d.position.copy(l.point(M.x, M.y, w)), d.distance = Math.hypot(m, w), d.decay = 2, d.intensity = w * w * (M.overhead ? 6 : 9), d.castShadow = _ < 1, d.shadow.camera.near = 0.08, d.shadow.camera.far = d.distance, d.shadow.camera.updateProjectionMatrix(), d.shadow.needsUpdate = !0;
      });
    },
    invalidateShadows() {
      for (const r of i) r.shadow.needsUpdate = !0;
    },
    dispose() {
      for (; i.length; ) o();
      a.dispose(), a.removeFromParent(), a.target.removeFromParent(), t.removeFromParent(), n.removeFromParent();
    }
  };
}
var Qs = class extends Ie {
  constructor() {
    super();
    const e = new Ke();
    e.deleteAttribute("uv");
    const s = new Le({ side: 1 }), t = new Le(), a = new Ze(16777215, 900, 28, 2);
    a.position.set(0.418, 16.199, 0.3), this.add(a);
    const n = new Y(e, s);
    n.position.set(-0.757, 13.219, 0.717), n.scale.set(31.713, 28.305, 28.591), this.add(n);
    const i = new J(e, t, 6), o = new jt();
    o.position.set(-10.906, 2.009, 1.846), o.rotation.set(0, -0.195, 0), o.scale.set(2.328, 7.905, 4.651), o.updateMatrix(), i.setMatrixAt(0, o.matrix), o.position.set(-5.607, -0.754, -0.758), o.rotation.set(0, 0.994, 0), o.scale.set(1.97, 1.534, 3.955), o.updateMatrix(), i.setMatrixAt(1, o.matrix), o.position.set(6.167, 0.857, 7.803), o.rotation.set(0, 0.561, 0), o.scale.set(3.927, 6.285, 3.687), o.updateMatrix(), i.setMatrixAt(2, o.matrix), o.position.set(-2.017, 0.018, 6.124), o.rotation.set(0, 0.333, 0), o.scale.set(2.002, 4.566, 2.064), o.updateMatrix(), i.setMatrixAt(3, o.matrix), o.position.set(2.291, -0.756, -2.621), o.rotation.set(0, -0.286, 0), o.scale.set(1.546, 1.552, 1.496), o.updateMatrix(), i.setMatrixAt(4, o.matrix), o.position.set(-2.193, -0.369, -5.547), o.rotation.set(0, 0.516, 0), o.scale.set(3.875, 3.487, 2.986), o.updateMatrix(), i.setMatrixAt(5, o.matrix), this.add(i);
    const r = new Y(e, ne(50));
    r.position.set(-16.116, 14.37, 8.208), r.scale.set(0.1, 2.428, 2.739), this.add(r);
    const l = new Y(e, ne(50));
    l.position.set(-16.109, 18.021, -8.207), l.scale.set(0.1, 2.425, 2.751), this.add(l);
    const f = new Y(e, ne(17));
    f.position.set(14.904, 12.198, -1.832), f.scale.set(0.15, 4.265, 6.331), this.add(f);
    const h = new Y(e, ne(43));
    h.position.set(-0.462, 8.89, 14.52), h.scale.set(4.38, 5.441, 0.088), this.add(h);
    const c = new Y(e, ne(20));
    c.position.set(3.235, 11.486, -12.541), c.scale.set(2.5, 2, 0.1), this.add(c);
    const p = new Y(e, ne(100));
    p.position.set(0, 20, 0), p.scale.set(1, 0.1, 1), this.add(p);
  }
  dispose() {
    const e = /* @__PURE__ */ new Set();
    this.traverse((s) => {
      s.isMesh && (e.add(s.geometry), e.add(s.material));
    });
    for (const s of e) s.dispose();
  }
};
function ne(e) {
  return new Dt({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: e
  });
}
function Js(e, s) {
  const t = new Ct(e), a = new Qs();
  let n;
  try {
    n = t.fromScene(a, 0.06, 0.1, 100, { size: 128 });
  } finally {
    a.dispose(), t.dispose();
  }
  return s.environment = n.texture, {
    update(i) {
      s.environmentIntensity = i?.natural === "night" ? 0.08 : 0.18;
    },
    dispose() {
      s.environment = null, n.dispose();
    }
  };
}
function io(e, s, t) {
  let a, n, i, o, r, l, f, h, c, p, b = !1, g = !1, y = !0, P = 0, M = 0, _ = 0, d = !0, m = !1, w = !1, x, u = "", O = "", z = !1, j = 14, B = 14;
  const A = new AbortController(), k = new Ie(), S = new At(-10, 10, 10, -10, 0.01, 1e3), F = new Z(), N = qs(k), L = () => !!e.closest(".theme-dark");
  let D = L();
  function R() {
    P && (cancelAnimationFrame(P), P = 0);
  }
  function I() {
    b || (b = !0, R(), A.abort(), h?.disconnect(), c?.disconnect(), p?.disconnect(), i?.dispose(), n?.dispose(), l?.dispose(), o?.dispose(), r?.dispose(), N.dispose(), f?.dispose(), a?.dispose(), a?.forceContextLoss(), a?.domElement.remove(), k.clear());
  }
  function U(T) {
    b || g || (g = !0, R(), t.fallback(T));
  }
  function K() {
    b || g || P || document.hidden || !e.isConnected || !y || M <= 0 || _ <= 0 || (P = requestAnimationFrame(() => {
      if (P = 0, !(document.hidden || !e.isConnected || !e.getClientRects().length))
        try {
          z && x && (z = !1, Qe(x)), a.getSize(F), (F.x !== M || F.y !== _) && a.setSize(M, _, !1), a.render(k, S), l?.update(S, M, _, d);
        } catch {
          U("三维画面暂不可用，已切换二维。");
        }
    }));
  }
  function X() {
    const [T, v, $, V] = x.viewBox, { frame: W } = o;
    return new te(W.point(T, v), W.point(T + $, v + V)).union(o.bounds);
  }
  function oe() {
    if (!n || !o) return;
    const T = X(), v = T.getCenter(new E()), $ = Math.max(1, T.getSize(new E()).length());
    n.target.copy(v), S.position.copy(v).add(new E(9, 13, 15).normalize().multiplyScalar($ * 2)), S.near = $ / 1e3, S.far = $ * 6, S.lookAt(v), S.updateMatrixWorld(!0);
    let V = 0, W = 0;
    for (const et of [T.min.x, T.max.x]) for (const tt of [T.min.y, T.max.y]) for (const st of [T.min.z, T.max.z]) {
      const Ae = new E(et, tt, st).applyMatrix4(S.matrixWorldInverse);
      V = Math.max(V, Math.abs(Ae.x)), W = Math.max(W, Math.abs(Ae.y));
    }
    j = V, B = W;
    const ee = Math.max(B, j / (M / _ || 1)) * 1.09;
    S.top = ee, S.bottom = -ee, S.left = -ee * (M / _ || 1), S.right = -S.left, S.zoom = 1, S.updateProjectionMatrix(), n.update(), K();
  }
  function ae() {
    if (b) return;
    const T = e.getBoundingClientRect();
    if (M = T.width, _ = T.height, M <= 0 || _ <= 0) {
      i?.cancel(), R();
      return;
    }
    S.top = Math.max(B, j / (M / _)) * 1.09, S.bottom = -S.top, S.left = -S.top * M / _, S.right = -S.left, S.updateProjectionMatrix(), K();
  }
  function Qe(T) {
    const v = O !== T.key, $ = v ? void 0 : o?.frame;
    l?.dispose(), l = void 0, o?.dispose(), o = void 0, v && (r?.dispose(), r = ks(async (V, W) => {
      const ee = await fetch(Vs[V], { signal: W });
      if (!ee.ok) throw new Error(`HTTP ${ee.status}`);
      return Ps(await ee.arrayBuffer());
    }, () => {
      z = !0, K();
    }, (V, W) => console.warn(`[Map 3D] ${V}: keeping procedural shape`, W))), o = Ss(T, D, r, $), O = T.key, k.add(o.group), o.updateWalls(m), l = Es(s, T, o.anchors, o.markerTops), l.symbols(w), N.update(T, o.frame, X(), o.anchors), f?.update(T.lighting), v && oe(), r?.sync(T.elements.flatMap((V) => {
      const W = Ve(V);
      return W ? [W] : [];
    }));
  }
  function Je(T) {
    if (b || g) return;
    const v = JSON.stringify(T);
    v !== u && (u = v, x = T, z = !0, K());
  }
  function fe(T) {
    S.zoom = ge.clamp(S.zoom * T, 0.4, 6), S.updateProjectionMatrix(), K();
  }
  try {
    a = new Rt({
      antialias: !0,
      alpha: !0,
      powerPreference: "low-power"
    }), a.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8)), a.setClearColor(0, 0), a.outputColorSpace = xe, a.toneMapping = 7, a.toneMappingExposure = 1.1, a.shadowMap.enabled = !0, a.shadowMap.type = 2, f = Js(a, k), a.debug.onShaderError = () => U("图形驱动无法绘制三维，已切换二维。");
    const T = a.domElement;
    T.setAttribute("aria-label", "三维场景：左键拖动旋转，Shift + 左键拖动平移，滚轮缩放；单指平移，双指拖动旋转、捏合缩放；方向键旋转，Home 全图"), T.title = "左键拖动旋转 · Shift + 左键拖动平移 · 滚轮缩放", T.setAttribute("role", "group"), T.tabIndex = 0, e.prepend(T), n = new Bt(S, T), i = at(T, (v) => {
      T.dispatchEvent(new PointerEvent("pointercancel", { pointerId: v }));
    }), n.mouseButtons.RIGHT = null, n.touches = {
      ONE: Q.PAN,
      TWO: Q.DOLLY_ROTATE
    }, n.enableDamping = !1, n.minPolarAngle = 0.08, n.maxPolarAngle = Math.PI * 0.46, n.minZoom = 0.4, n.maxZoom = 6, n.rotateSpeed = 0.65, n.zoomSpeed = 0.8, n.addEventListener("change", K), T.addEventListener("webglcontextlost", (v) => {
      v.preventDefault(), U("图形连接已中断，已切换二维。重新打开地图可重试。");
    }, { signal: A.signal }), T.addEventListener("keydown", (v) => {
      if (!(v.ctrlKey || v.metaKey || v.altKey)) {
        if (v.key === "Home") oe();
        else if (v.key === "+" || v.key === "=") fe(1.2);
        else if (v.key === "-") fe(1 / 1.2);
        else if ([
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ].includes(v.key)) {
          const $ = new be().setFromVector3(S.position.clone().sub(n.target));
          $.theta += v.key === "ArrowLeft" ? -0.13 : v.key === "ArrowRight" ? 0.13 : 0, $.phi = ge.clamp($.phi + (v.key === "ArrowUp" ? -0.1 : v.key === "ArrowDown" ? 0.1 : 0), n.minPolarAngle, n.maxPolarAngle), S.position.copy(n.target).add(new E().setFromSpherical($)), n.update(), K();
        } else return;
        v.preventDefault();
      }
    }, { signal: A.signal }), h = new ResizeObserver(() => {
      try {
        ae();
      } catch {
        U("三维画面尺寸调整失败，已切换二维。");
      }
    }), h.observe(e), ae(), c = new IntersectionObserver((v) => {
      y = v[0].isIntersecting, y ? K() : R();
    }), c.observe(e), document.addEventListener("visibilitychange", () => {
      document.hidden ? R() : K();
    }, { signal: A.signal }), p = new MutationObserver(() => {
      const v = L();
      v !== D && (D = v, z = !0, K());
    });
    for (let v = e; v; v = v.parentElement) p.observe(v, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    return {
      dispose: I,
      setScene: Je,
      fit: oe,
      zoom: fe,
      labels(v) {
        d = v, K();
      },
      walls(v) {
        m = v, o?.updateWalls(v), N.invalidateShadows(), K();
      },
      symbols(v) {
        w = v, l?.symbols(v), K();
      }
    };
  } catch (T) {
    throw I(), T;
  }
}
export {
  io as createThreeRuntime
};
