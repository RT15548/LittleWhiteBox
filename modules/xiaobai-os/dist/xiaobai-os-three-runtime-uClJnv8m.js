/* eslint-disable */
import { C as oe, D as ae, S as ie, _ as ne, a as re, b as ce, c as Ut, d as le, f as Lt, g as he, h as Nt, i as pt, l as de, m as fe, n as ue, o as ht, p as st, r as pe, s as me, u as be, v as ge, x as ye, y as we } from "./xiaobai-os-MapBrowser-BRxzhaHI.js";
import { $ as q, C as _e, D as mt, Dt as It, Et as xt, Ft as Mt, G as Bt, It as bt, M as J, O as xe, Q as gt, R as Me, Rt as Q, St as Se, T as ct, Ut as K, V as Ee, W as St, Wt as P, X as rt, _ as Pe, b as kt, dt as ve, et as Y, f as Ae, g as Gt, it as Rt, k as Yt, kt as Te, l as dt, m as yt, mt as Kt, n as Le, nt as ke, o as et, pt as Re, rt as De, s as Ht, t as ze, tt as Oe, ut as Ce, v as Et, wt as Wt, x as Fe, xt as Pt, y as vt, yt as wt, z as je } from "./xiaobai-os-three.module-Bxd-t3Ck.js";
import { t as Dt } from "./xiaobai-os-RoundedBoxGeometry-Cuf6zpAz.js";
import { t as Ue } from "./xiaobai-os-BufferGeometryUtils-Cb-FyMS_.js";
import { t as Ne } from "./xiaobai-os-GLTFLoader-C4rUKqFr.js";
var zt = { type: "change" }, At = { type: "start" }, Zt = { type: "end" }, lt = new Se(), Ot = new Re(), Ie = Math.cos(70 * gt.DEG2RAD), G = new P(), W = 2 * Math.PI, C = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, ut = 1e-6, Be = class extends Pe {
  constructor(t, s = null) {
    super(t, s), this.state = C.NONE, this.target = new P(), this.cursor = new P(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
      LEFT: "ArrowLeft",
      UP: "ArrowUp",
      RIGHT: "ArrowRight",
      BOTTOM: "ArrowDown"
    }, this.mouseButtons = {
      LEFT: rt.ROTATE,
      MIDDLE: rt.DOLLY,
      RIGHT: rt.PAN
    }, this.touches = {
      ONE: Q.ROTATE,
      TWO: Q.DOLLY_PAN
    }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new P(), this._lastQuaternion = new wt(), this._lastTargetPosition = new P(), this._quat = new wt().setFromUnitVectors(t.up, new P(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new bt(), this._sphericalDelta = new bt(), this._scale = 1, this._panOffset = new P(), this._rotateStart = new K(), this._rotateEnd = new K(), this._rotateDelta = new K(), this._panStart = new K(), this._panEnd = new K(), this._panDelta = new K(), this._dollyStart = new K(), this._dollyEnd = new K(), this._dollyDelta = new K(), this._dollyDirection = new P(), this._mouse = new K(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Ye.bind(this), this._onPointerDown = Ge.bind(this), this._onPointerUp = Ke.bind(this), this._onContextMenu = qe.bind(this), this._onMouseWheel = Ze.bind(this), this._onKeyDown = Xe.bind(this), this._onTouchStart = $e.bind(this), this._onTouchMove = Ve.bind(this), this._onMouseDown = He.bind(this), this._onMouseMove = We.bind(this), this._interceptControlDown = Qe.bind(this), this._interceptControlUp = Je.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
  }
  connect(t) {
    super.connect(t), this.domElement.addEventListener("pointerdown", this._onPointerDown), this.domElement.addEventListener("pointercancel", this._onPointerUp), this.domElement.addEventListener("contextmenu", this._onContextMenu), this.domElement.addEventListener("wheel", this._onMouseWheel, { passive: !1 }), this.domElement.getRootNode().addEventListener("keydown", this._interceptControlDown, {
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
  listenToKeyEvents(t) {
    t.addEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = t;
  }
  stopListenToKeyEvents() {
    this._domElementKeyEvents !== null && (this._domElementKeyEvents.removeEventListener("keydown", this._onKeyDown), this._domElementKeyEvents = null);
  }
  saveState() {
    this.target0.copy(this.target), this.position0.copy(this.object.position), this.zoom0 = this.object.zoom;
  }
  reset() {
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(zt), this.update(), this.state = C.NONE;
  }
  update(t = null) {
    const s = this.object.position;
    G.copy(s).sub(this.target), G.applyQuaternion(this._quat), this._spherical.setFromVector3(G), this.autoRotate && this.state === C.NONE && this._rotateLeft(this._getAutoRotationAngle(t)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let e = this.minAzimuthAngle, a = this.maxAzimuthAngle;
    isFinite(e) && isFinite(a) && (e < -Math.PI ? e += W : e > Math.PI && (e -= W), a < -Math.PI ? a += W : a > Math.PI && (a -= W), e <= a ? this._spherical.theta = Math.max(e, Math.min(a, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (e + a) / 2 ? Math.max(e, this._spherical.theta) : Math.min(a, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
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
        const o = new P(this._mouse.x, this._mouse.y, 0);
        o.unproject(this.object);
        const r = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), n = r !== this.object.zoom;
        const l = new P(this._mouse.x, this._mouse.y, 0);
        l.unproject(this.object), this.object.position.sub(l).add(o), this.object.updateMatrixWorld(), i = G.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      i !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(i).add(this.object.position) : (lt.origin.copy(this.object.position), lt.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(lt.direction)) < Ie ? this.object.lookAt(this.target) : (Ot.setFromNormalAndCoplanarPoint(this.object.up, this.target), lt.intersectPlane(Ot, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const i = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), i !== this.object.zoom && (this.object.updateProjectionMatrix(), n = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, n || this._lastPosition.distanceToSquared(this.object.position) > ut || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > ut || this._lastTargetPosition.distanceToSquared(this.target) > ut ? (this.dispatchEvent(zt), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(t) {
    return t !== null ? W / 60 * this.autoRotateSpeed * t : W / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(t) {
    const s = Math.abs(t * 0.01);
    return Math.pow(0.95, this.zoomSpeed * s);
  }
  _rotateLeft(t) {
    this._sphericalDelta.theta -= t;
  }
  _rotateUp(t) {
    this._sphericalDelta.phi -= t;
  }
  _panLeft(t, s) {
    G.setFromMatrixColumn(s, 0), G.multiplyScalar(-t), this._panOffset.add(G);
  }
  _panUp(t, s) {
    this.screenSpacePanning === !0 ? G.setFromMatrixColumn(s, 1) : (G.setFromMatrixColumn(s, 0), G.crossVectors(this.object.up, G)), G.multiplyScalar(t), this._panOffset.add(G);
  }
  _pan(t, s) {
    const e = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const a = this.object.position;
      G.copy(a).sub(this.target);
      let n = G.length();
      n *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * t * n / e.clientHeight, this.object.matrix), this._panUp(2 * s * n / e.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(t * (this.object.right - this.object.left) / this.object.zoom / e.clientWidth, this.object.matrix), this._panUp(s * (this.object.top - this.object.bottom) / this.object.zoom / e.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(t) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= t : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(t, s) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = !0;
    const e = this.domElement.getBoundingClientRect(), a = t - e.left, n = s - e.top, i = e.width, o = e.height;
    this._mouse.x = a / i * 2 - 1, this._mouse.y = -(n / o) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
  }
  _clampDistance(t) {
    return Math.max(this.minDistance, Math.min(this.maxDistance, t));
  }
  _handleMouseDownRotate(t) {
    this._rotateStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownDolly(t) {
    this._updateZoomParameters(t.clientX, t.clientX), this._dollyStart.set(t.clientX, t.clientY);
  }
  _handleMouseDownPan(t) {
    this._panStart.set(t.clientX, t.clientY);
  }
  _handleMouseMoveRotate(t) {
    this._rotateEnd.set(t.clientX, t.clientY), this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const s = this.domElement;
    this._rotateLeft(W * this._rotateDelta.x / s.clientHeight), this._rotateUp(W * this._rotateDelta.y / s.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
  }
  _handleMouseMoveDolly(t) {
    this._dollyEnd.set(t.clientX, t.clientY), this._dollyDelta.subVectors(this._dollyEnd, this._dollyStart), this._dollyDelta.y > 0 ? this._dollyOut(this._getZoomScale(this._dollyDelta.y)) : this._dollyDelta.y < 0 && this._dollyIn(this._getZoomScale(this._dollyDelta.y)), this._dollyStart.copy(this._dollyEnd), this.update();
  }
  _handleMouseMovePan(t) {
    this._panEnd.set(t.clientX, t.clientY), this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd), this.update();
  }
  _handleMouseWheel(t) {
    this._updateZoomParameters(t.clientX, t.clientY), t.deltaY < 0 ? this._dollyIn(this._getZoomScale(t.deltaY)) : t.deltaY > 0 && this._dollyOut(this._getZoomScale(t.deltaY)), this.update();
  }
  _handleKeyDown(t) {
    let s = !1;
    switch (t.code) {
      case this.keys.UP:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(W * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), s = !0;
        break;
      case this.keys.BOTTOM:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateUp(-W * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), s = !0;
        break;
      case this.keys.LEFT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(W * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), s = !0;
        break;
      case this.keys.RIGHT:
        t.ctrlKey || t.metaKey || t.shiftKey ? this.enableRotate && this._rotateLeft(-W * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), s = !0;
        break;
    }
    s && (t.preventDefault(), this.update());
  }
  _handleTouchStartRotate(t) {
    if (this._pointers.length === 1) this._rotateStart.set(t.pageX, t.pageY);
    else {
      const s = this._getSecondPointerPosition(t), e = 0.5 * (t.pageX + s.x), a = 0.5 * (t.pageY + s.y);
      this._rotateStart.set(e, a);
    }
  }
  _handleTouchStartPan(t) {
    if (this._pointers.length === 1) this._panStart.set(t.pageX, t.pageY);
    else {
      const s = this._getSecondPointerPosition(t), e = 0.5 * (t.pageX + s.x), a = 0.5 * (t.pageY + s.y);
      this._panStart.set(e, a);
    }
  }
  _handleTouchStartDolly(t) {
    const s = this._getSecondPointerPosition(t), e = t.pageX - s.x, a = t.pageY - s.y, n = Math.sqrt(e * e + a * a);
    this._dollyStart.set(0, n);
  }
  _handleTouchStartDollyPan(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enablePan && this._handleTouchStartPan(t);
  }
  _handleTouchStartDollyRotate(t) {
    this.enableZoom && this._handleTouchStartDolly(t), this.enableRotate && this._handleTouchStartRotate(t);
  }
  _handleTouchMoveRotate(t) {
    if (this._pointers.length == 1) this._rotateEnd.set(t.pageX, t.pageY);
    else {
      const e = this._getSecondPointerPosition(t), a = 0.5 * (t.pageX + e.x), n = 0.5 * (t.pageY + e.y);
      this._rotateEnd.set(a, n);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const s = this.domElement;
    this._rotateLeft(W * this._rotateDelta.x / s.clientHeight), this._rotateUp(W * this._rotateDelta.y / s.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(t) {
    if (this._pointers.length === 1) this._panEnd.set(t.pageX, t.pageY);
    else {
      const s = this._getSecondPointerPosition(t), e = 0.5 * (t.pageX + s.x), a = 0.5 * (t.pageY + s.y);
      this._panEnd.set(e, a);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(t) {
    const s = this._getSecondPointerPosition(t), e = t.pageX - s.x, a = t.pageY - s.y, n = Math.sqrt(e * e + a * a);
    this._dollyEnd.set(0, n), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const i = (t.pageX + s.x) * 0.5, o = (t.pageY + s.y) * 0.5;
    this._updateZoomParameters(i, o);
  }
  _handleTouchMoveDollyPan(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enablePan && this._handleTouchMovePan(t);
  }
  _handleTouchMoveDollyRotate(t) {
    this.enableZoom && this._handleTouchMoveDolly(t), this.enableRotate && this._handleTouchMoveRotate(t);
  }
  _addPointer(t) {
    this._pointers.push(t.pointerId);
  }
  _removePointer(t) {
    delete this._pointerPositions[t.pointerId];
    for (let s = 0; s < this._pointers.length; s++) if (this._pointers[s] == t.pointerId) {
      this._pointers.splice(s, 1);
      return;
    }
  }
  _isTrackingPointer(t) {
    for (let s = 0; s < this._pointers.length; s++) if (this._pointers[s] == t.pointerId) return !0;
    return !1;
  }
  _trackPointer(t) {
    let s = this._pointerPositions[t.pointerId];
    s === void 0 && (s = new K(), this._pointerPositions[t.pointerId] = s), s.set(t.pageX, t.pageY);
  }
  _getSecondPointerPosition(t) {
    const s = t.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[s];
  }
  _customWheelEvent(t) {
    const s = t.deltaMode, e = {
      clientX: t.clientX,
      clientY: t.clientY,
      deltaY: t.deltaY
    };
    switch (s) {
      case 1:
        e.deltaY *= 16;
        break;
      case 2:
        e.deltaY *= 100;
        break;
    }
    return t.ctrlKey && !this._controlActive && (e.deltaY *= 10), e;
  }
};
function Ge(t) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(t.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(t) && (this._addPointer(t), t.pointerType === "touch" ? this._onTouchStart(t) : this._onMouseDown(t)));
}
function Ye(t) {
  this.enabled !== !1 && (t.pointerType === "touch" ? this._onTouchMove(t) : this._onMouseMove(t));
}
function Ke(t) {
  switch (this._removePointer(t), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(t.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(Zt), this.state = C.NONE;
      break;
    case 1:
      const s = this._pointers[0], e = this._pointerPositions[s];
      this._onTouchStart({
        pointerId: s,
        pageX: e.x,
        pageY: e.y
      });
      break;
  }
}
function He(t) {
  let s;
  switch (t.button) {
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
    case rt.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(t), this.state = C.DOLLY;
      break;
    case rt.ROTATE:
      if (t.ctrlKey || t.metaKey || t.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(t), this.state = C.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(t), this.state = C.ROTATE;
      }
      break;
    case rt.PAN:
      if (t.ctrlKey || t.metaKey || t.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(t), this.state = C.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(t), this.state = C.PAN;
      }
      break;
    default:
      this.state = C.NONE;
  }
  this.state !== C.NONE && this.dispatchEvent(At);
}
function We(t) {
  switch (this.state) {
    case C.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(t);
      break;
    case C.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(t);
      break;
    case C.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(t);
      break;
  }
}
function Ze(t) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== C.NONE || (t.preventDefault(), this.dispatchEvent(At), this._handleMouseWheel(this._customWheelEvent(t)), this.dispatchEvent(Zt));
}
function Xe(t) {
  this.enabled !== !1 && this._handleKeyDown(t);
}
function $e(t) {
  switch (this._trackPointer(t), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case Q.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(t), this.state = C.TOUCH_ROTATE;
          break;
        case Q.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(t), this.state = C.TOUCH_PAN;
          break;
        default:
          this.state = C.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case Q.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(t), this.state = C.TOUCH_DOLLY_PAN;
          break;
        case Q.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(t), this.state = C.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = C.NONE;
      }
      break;
    default:
      this.state = C.NONE;
  }
  this.state !== C.NONE && this.dispatchEvent(At);
}
function Ve(t) {
  switch (this._trackPointer(t), this.state) {
    case C.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(t), this.update();
      break;
    case C.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(t), this.update();
      break;
    case C.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(t), this.update();
      break;
    case C.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(t), this.update();
      break;
    default:
      this.state = C.NONE;
  }
}
function qe(t) {
  this.enabled !== !1 && t.preventDefault();
}
function Qe(t) {
  t.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function Je(t) {
  t.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
var Ct = {
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
function ts(t) {
  if (st(t) || ["wall", "grid"].includes(t.category) || !t.icon || !Object.hasOwn(Ct, t.icon)) return;
  const s = t.icon;
  return Ct[s].includes(t.shape) ? s : void 0;
}
function es(t) {
  const [s, e, a, n] = t.viewBox, i = ge(a, n);
  return {
    scale: i,
    point: (o, r, l = 0) => new P((o - s - a / 2) / i, l, (r - e - n / 2) / i)
  };
}
function ss(t, s) {
  const e = Nt(t), a = [e.x + e.width / 2, e.y + e.height / 2], n = ne(t), i = n.points.map(([o, r]) => new K((o - a[0]) / s, (r - a[1]) / s));
  return n.closed && i.length > 1 && i[0].equals(i[i.length - 1]) && i.pop(), {
    center: a,
    width: e.width / s,
    depth: e.height / s,
    points: i,
    closed: n.closed,
    rotation: -(t.rotation || 0) * Math.PI / 180
  };
}
function os(t, s) {
  const e = new _e(new Te(t.map((a) => new K(a.x, -a.y))), {
    depth: s,
    bevelEnabled: !1,
    steps: 1,
    curveSegments: 1
  });
  return e.rotateX(-Math.PI / 2), e;
}
function as(t, s, e) {
  const a = t.map((n) => new P(n.x, e, n.y));
  return s && a.length && a.push(a[0].clone()), new dt().setFromPoints(a);
}
function is(t, s, e) {
  const a = [];
  for (let i = 0; i < t.length - (s ? 0 : 1); i += 1) {
    const o = t[i], r = t[(i + 1) % t.length], l = r.clone().sub(o);
    if (!l.lengthSq()) continue;
    const f = new K(-l.y, l.x).normalize().multiplyScalar(e / 2), h = [
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
  const n = new dt();
  return n.setAttribute("position", new ct(a, 3)), n.computeVertexNormals(), n;
}
function Xt(t, s) {
  return t.slice(0, s ? t.length : -1).flatMap((e, a) => {
    const n = t[(a + 1) % t.length], i = e.distanceTo(n);
    return i ? [{
      x: (e.x + n.x) / 2,
      z: (e.y + n.y) / 2,
      length: i,
      rotation: -Math.atan2(n.y - e.y, n.x - e.x)
    }] : [];
  });
}
function it(t, s, e) {
  const a = t / 128 * e, n = s / 128 * e, i = Math.floor(a), o = Math.floor(n), r = (c) => c * c * (3 - 2 * c), l = (c, p) => {
    let b = Math.imul(c % e + 17, 374761393) + Math.imul(p % e + 41, 668265263);
    return b = Math.imul(b ^ b >>> 13, 1274126177), ((b ^ b >>> 16) >>> 0) / 4294967296;
  }, f = r(a - i), h = r(n - o);
  return (l(i, o) * (1 - f) + l(i + 1, o) * f) * (1 - h) + (l(i, o + 1) * (1 - f) + l(i + 1, o + 1) * f) * h;
}
function ns(t, s) {
  const a = new Uint8Array(65536);
  let n = 781;
  for (let o = 0; o < 128; o += 1) for (let r = 0; r < 128; r += 1) {
    n = Math.imul(n, 1664525) + 1013904223 >>> 0;
    const l = n / 4294967296;
    let f = 0.94 + l * 0.06;
    if (t === "wood") {
      if (f = 0.94 + Math.sin(o * 0.32 + Math.sin(r * Math.PI / 64) * 0.8 + Math.sin(o * 0.14)) * 0.014 + l * 0.012, s) {
        const c = Math.floor(o / 32);
        f += [
          0,
          0.018,
          -0.015,
          0.01
        ][c], (o % 32 === 0 || (r + c * 47) % 128 === 0) && (f = 0.83);
      }
    } else t === "tile" ? f = r % 64 < 2 || o % 64 < 2 ? 0.73 : 0.96 + l * 0.04 : [
      "fabric",
      "carpet",
      "bed-sheet",
      "tatami"
    ].includes(t) ? f = 0.95 + (r % 4 < 2 == o % 4 < 2 ? 0.012 : 0) + l * 0.018 : t === "stone" || t === "marble" ? f = 0.86 + it(r, o, 4) * 0.085 + it(r, o, 16) * 0.035 + l * 0.02 : [
      "grass",
      "forest",
      "dirt",
      "sand",
      "snow"
    ].includes(t) ? f = 0.91 + it(r, o, 4) * 0.04 + it(r, o, 16) * 0.025 + l * 0.015 : [
      "water",
      "slime",
      "blood",
      "flesh"
    ].includes(t) ? f = 0.92 + (it(r, o, 4) * 0.6 + it(r, o, 8) * 0.4) * (t === "flesh" ? 0.06 : 0.035) + l * 8e-3 : t === "metal" && (f = 0.97 + Math.sin(o * 2) * 8e-3 + l * 0.012);
    const h = Math.round(f * 255);
    a.set([
      h,
      h,
      h,
      255
    ], (o * 128 + r) * 4);
  }
  const i = new vt(a, 128, 128, Pt);
  return i.colorSpace = xt, i.wrapS = i.wrapT = Wt, s && t === "wood" && i.repeat.set(0.28, 0.28), i.magFilter = St, i.minFilter = Bt, i.generateMipmaps = !0, i.anisotropy = 4, i.needsUpdate = !0, i;
}
function rs(t, s) {
  const e = ye(t), a = ce[t];
  function n(i, o) {
    const r = o ? i : new Uint8Array(e.size * e.size * 4);
    if (!o) for (let f = 0; f < i.length; f++) r.set([
      i[f],
      i[f],
      i[f],
      255
    ], f * 4);
    const l = s.own(new vt(r, e.size, e.size, Pt));
    return o && (l.colorSpace = xt), l.wrapS = l.wrapT = Wt, l.repeat.setScalar(1 / a.size), l.magFilter = St, l.minFilter = Bt, l.generateMipmaps = !0, l.anisotropy = 4, l.needsUpdate = !0, l;
  }
  return {
    map: n(e.color, !0),
    bumpMap: n(e.height, !1),
    roughnessMap: n(e.roughness, !1),
    bumpScale: a.relief
  };
}
var cs = {
  ...oe,
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
function ls(t, s, e) {
  const a = pt(e), n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function l(c, p = 0, b = !1) {
    const g = c.material || (c.category === "water" ? "water" : "unknown"), y = b && ie(g) ? g : void 0, v = `${g}:${c.category}:${c.certainty}:${p}:${!!y}`;
    let M = n.get(v);
    if (!M) {
      const _ = {
        danger: "#d77c80",
        magic: "#b29cdb",
        light: "#f4d697",
        actor: "#4598cf",
        marker: "#72b9cb",
        secret: "#8d9ca9"
      }, d = c.category === "terrain", m = g === "wood" && d ? "#b69a77" : cs[g], w = new yt(y ? "#ffffff" : !c.material && c.category in _ ? _[c.category] : m);
      w.lerp(new yt(p > 0 ? "#ffffff" : "#201c1a"), Math.abs(p));
      const x = ht(c, "").opacity * (g === "glass" ? 0.42 : g === "slime" ? 0.88 : 1), u = !y && ![
        "unknown",
        "glass",
        "rune",
        "warm-light",
        "cold-light",
        "shadow"
      ].includes(g), O = `${g}:${d}`;
      u && !o.has(O) && o.set(O, t.own(ns(g, d)));
      const z = u ? o.get(O) : null;
      y && !r.has(y) && r.set(y, rs(y, t));
      const j = y ? r.get(y) : void 0, B = [
        "water",
        "slime",
        "flesh",
        "blood",
        "glass"
      ].includes(g);
      M = t.own(new De({
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
      })), n.set(v, M);
    }
    return M;
  }
  function f(c) {
    const p = `${c.certainty}:${c.category}`;
    let b = i.get(p);
    if (!b) {
      const g = c.certainty && c.certainty !== "confirmed";
      b = t.own(new Ee({
        color: s ? "#91a4b2" : "#596d78",
        dashSize: c.certainty === "unknown" ? 0.035 : 0.12,
        gapSize: g ? 0.09 : 0,
        transparent: !0,
        opacity: ht(c, "").opacity * (g ? 0.7 : 0.28)
      })), i.set(p, b);
    }
    return b;
  }
  function h(c, p = 0) {
    const b = e?.artificial === "on" ? c.material === "cold-light" ? "cold-light" : "warm-light" : "bed-sheet";
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
var $t = class {
  resources = /* @__PURE__ */ new Set();
  own(t) {
    return this.resources.add(t), t;
  }
  dispose() {
    for (const t of this.resources) t.dispose();
    this.resources.clear();
  }
};
function hs(t, s, e, a) {
  const { cylinder: n, ring: i, cone: o } = a;
  switch (t) {
    case "column": {
      const r = s.shape === "circle" ? n : void 0;
      return e(0, 0.08, 0, 1, 0.16, 1, -0.12, r), e(0, 0.91, 0, 0.68, 1.5, 0.68, 0.02, r), e(0, 1.7, 0, 0.9, 0.12, 0.9, 0.12, r), 1.76;
    }
    case "partition":
      for (const r of [-0.4, 0.4])
        e(r, 0.055, 0, 0.15, 0.11, 1, -0.18), e(r, 0.79, 0, 0.07, 1.5, 0.15, -0.15);
      return e(0, 0.83, 0, 0.78, 1.27, 0.09, 0.08), e(0, 1.5, 0, 0.88, 0.06, 0.15, 0.14), 1.54;
    case "ladder":
      for (const r of [-0.36, 0.36]) e(r, 0.9, 0, 0.09, 1.8, 0.2, -0.1);
      for (let r = 0; r < 6; r++) e(0, 0.18 + r * 0.29, 0, 0.7, 0.055, 0.16, 0.13);
      return 1.8;
    case "well":
      return e(0, 0.21, 0, 0.94, 0.42, 0.94, -0.08, i, s.material || "stone"), e(0, 0.44, 0, 1, 0.08, 1, 0.12, i, s.material || "stone"), 0.48;
    case "fountain":
      return e(0, 0.03, 0, 0.92, 0.06, 0.92, -0.2, n, s.material || "stone"), e(0, 0.13, 0, 1, 0.2, 1, 0.1, i, s.material || "stone"), e(0, 0.38, 0, 0.18, 0.7, 0.18, -0.06, n, s.material || "stone"), e(0, 0.72, 0, 0.48, 0.1, 0.48, 0.12, i, s.material || "stone"), e(0, 0.85, 0, 0.08, 0.17, 0.08, -0.12, n, s.material || "stone"), 0.935;
    case "fire":
      return e(0, 0.055, 0, 0.85, 0.11, 0.17, -0.28, void 0, "wood"), e(0, 0.11, 0, 0.17, 0.11, 0.85, -0.15, void 0, "wood"), e(0, 0.43, 0, 0.6, 0.62, 0.6, 0, o, "warm-light"), e(0.1, 0.31, 0.12, 0.32, 0.4, 0.32, 0.35, o, "warm-light"), 0.74;
    case "flag":
      return e(-0.37, 0.035, 0, 0.25, 0.07, 0.7, -0.22), e(-0.37, 0.8, 0, 0.045, 1.6, 0.08, -0.15), e(0.04, 1.28, 0, 0.77, 0.46, 0.035, 0.1, void 0, s.material || "fabric"), 1.6;
    case "sign":
      for (const r of [-0.3, 0.3])
        e(r, 0.055, 0, 0.18, 0.11, 0.85, -0.22), e(r, 0.62, 0, 0.07, 1.2, 0.16, -0.12);
      return e(0, 0.9, 0, 1, 0.64, 0.18, -0.05), e(0, 0.9, 0.095, 0.9, 0.52, 0.025, 0.22), 1.22;
    case "terminal":
      return e(0, 0.065, 0, 0.72, 0.13, 0.84, -0.25), e(0, 0.54, -0.09, 0.4, 1, 0.44, -0.1), e(0, 1.1, -0.12, 1, 0.7, 0.3, -0.16), e(0, 1.11, 0.04, 0.86, 0.54, 0.025, -0.6), e(0, 0.77, 0.21, 0.88, 0.06, 0.55, 0.12), 1.45;
    case "machine":
      e(0, 0.055, 0, 1, 0.11, 1, -0.25), e(-0.16, 0.39, 0, 0.62, 0.64, 0.82, 0), e(-0.16, 0.79, 0, 0.54, 0.22, 0.72, 0.15), e(0.34, 0.46, 0, 0.26, 0.76, 0.73, -0.14);
      for (const r of [
        -0.34,
        -0.2,
        -0.06,
        0.08
      ]) e(r, 0.5, 0.421, 0.04, 0.3, 0.014, -0.5);
      return 0.9;
    case "vending-machine":
      return e(0, 0.1, 0, 0.94, 0.2, 0.86, -0.25), e(0, 0.92, 0, 1, 1.68, 0.92, -0.02), e(-0.12, 1.11, 0.468, 0.64, 1.05, 0.018, -0.5), e(0.34, 1.05, 0.48, 0.17, 0.38, 0.03, -0.18), e(0, 0.31, 0.468, 0.74, 0.18, 0.018, -0.65), e(0, 1.73, 0, 1, 0.07, 0.98, 0.16), 1.765;
  }
}
function ds(t, s) {
  const e = t.own(new Dt(1, 1, 1, 3, 0.035)), a = t.own(new Dt(1, 1, 1, 4, 0.16)), n = t.own(e.clone()), i = n.getAttribute("position");
  for (let c = 0; c < i.count; c += 1) {
    const p = 0.72 + 0.28 * (i.getY(c) + 0.5);
    i.setX(c, i.getX(c) * p), i.setZ(c, i.getZ(c) * p);
  }
  n.computeVertexNormals();
  const o = t.own(new Et(0.5, 0.5, 1, 32)), r = t.own(new Mt(0.5, 16, 10)), l = t.own(new Fe(0.5, 0)), f = t.own(new Gt(0.5, 1, 9)), h = t.own(new Me([
    [0.35, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [0.35, 0.5],
    [0.35, -0.5]
  ].map(([c, p]) => new K(c, p)), 32));
  return function(p, b, g, y, v) {
    const M = Math.min(1.6, Math.min(y, v)), _ = /* @__PURE__ */ new Map();
    function d(u, O, z, j, B, T, A = 0, S = e, F) {
      const N = s.mesh(F ? {
        ...b,
        material: F
      } : b, A), k = `${S.uuid}:${N.uuid}`;
      _.has(k) || _.set(k, {
        geometry: S,
        material: N,
        matrices: []
      }), _.get(k).matrices.push(new q().makeScale(j * y, B * M, T * v).setPosition(u * y, O * M, z * v));
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
      const j = t.own(new J(u, O, z.length));
      z.forEach((B, T) => j.setMatrixAt(T, B)), j.castShadow = O.opacity >= 0.8, j.receiveShadow = !0, p.add(j);
    }
    return x;
  };
}
var fs = /* @__PURE__ */ JSON.parse('[{"icon":"table","file":"table.glb","originalFile":"furniture/Models/GLTF format/table.glb","sourceSha256":"ff1a94498d023957f4bc3ff6f55a7a82977d336dbf01a573b3364f03afe5ff61","sha256":"07cd3bfb1f6884b7476a2e6222f735bbd0e7ff9b29c59f210d9a06fe9f1ba5e8","bytes":12476,"triangles":120,"batches":1,"geometryBytes":11520,"size":[0.8414879441261292,0.3267339766025543,0.44737333059310913],"radius":0.4765094062648687},{"icon":"chair","file":"chairRounded.glb","originalFile":"furniture/Models/GLTF format/chairRounded.glb","sourceSha256":"53f4933ec547179c499f04dbda1231cf44b83ec82c7f4ab981cdf680aee5c973","sha256":"f62c6c7e655f8360971bd859c14c150a1f77355f14b5379b29cdd6d1fb97db4c","bytes":27844,"triangles":280,"batches":1,"geometryBytes":26880,"size":[0.20000000298023224,0.45499998331069946,0.20000000298023224],"radius":0.14142135834465194},{"icon":"bed","file":"bedSingle.glb","originalFile":"furniture/Models/GLTF format/bedSingle.glb","sourceSha256":"ca00c63f9a12da3138d902b2f5f18e0360fb6e8a5ac42ccb4bc3f185724b65d1","sha256":"b89c28f9ad8e77ddbc8fd9bcfb8a8f87157a7c8971dd20ee0718b6f585629c89","bytes":22864,"triangles":214,"batches":3,"geometryBytes":20544,"size":[0.5709999799728394,0.375,1.125],"radius":0.6294541280557842},{"icon":"shelf","file":"bookcaseOpenLow.glb","originalFile":"furniture/Models/GLTF format/bookcaseOpenLow.glb","sourceSha256":"6d4d625faf977a2dbf155f1313cd32c6310e463114a1cd4c08cb9f80a5fb1d75","sha256":"c67a8d18cd802afb82d74a73d0c0dc85a7188facbfb5ede13909b9bc6cc33226","bytes":18596,"triangles":184,"batches":1,"geometryBytes":17664,"size":[0.4000000059604645,0.4000000059604645,0.25],"radius":0.23584953082864699},{"icon":"tree","file":"tree_oak.glb","originalFile":"nature/Models/GLTF format/tree_oak.glb","sourceSha256":"d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3","sha256":"adb24a59f159f214971fefe7e51539d7a938a8a3908b0d756c25e914d0bce681","bytes":20500,"triangles":196,"batches":2,"geometryBytes":18816,"size":[0.6405540108680725,1.2262399204075336,0.7396479845046997],"radius":0.36982402101696993},{"icon":"rock","file":"stone_largeE.glb","originalFile":"nature/Models/GLTF format/stone_largeE.glb","sourceSha256":"392cf28f85aa4b7b7c5e12b1a3b87fe2b3a7c5ec1797d5d1d0d58edca6da9de8","sha256":"07185b2e5f8ce40fc14e8c29db249fa607da56651abcf22f93f8c02f4d7512af","bytes":7116,"triangles":64,"batches":1,"geometryBytes":6144,"size":[1.095458745956421,0.2922479815781114,0.9198710918426514],"radius":0.5865749968024526},{"icon":"stool","file":"stoolBar.glb","originalFile":"furniture/Models/GLTF format/stoolBar.glb","sourceSha256":"a86167a9f92401a61fec7e509ad089ecc552d0f299743add3aeb919acb24e341","sha256":"6fe6e654458f50ab7e73cc5977f055a50562cb74a56a8bd5ebaac312f03c4563","bytes":17852,"triangles":176,"batches":1,"geometryBytes":16896,"size":[0.2654399871826172,0.4350000023841858,0.2298777848482132],"radius":0.13272000284524055},{"icon":"bench","file":"bench.glb","originalFile":"furniture/Models/GLTF format/bench.glb","sourceSha256":"ba05a6d23a5a5a44da016757632070e47ff7587ce10e2f6d6d52328b4cf5489b","sha256":"21bd02dce1f980aff3bc22c916bdcbefa3db2fa11bd5dbbc9fbb07830f9bd87b","bytes":17280,"triangles":170,"batches":1,"geometryBytes":16320,"size":[0.4000000059604645,0.4699999988079071,0.20000000298023224],"radius":0.22360680108197992},{"icon":"sofa","file":"loungeSofa.glb","originalFile":"furniture/Models/GLTF format/loungeSofa.glb","sourceSha256":"1886b811c0d3ad0d8525a4fd43adf4112c497c8e0ed906f06877ca3517f4c7dd","sha256":"a4a0b16aa48731b61fcc08302c8bca8d2ff9e1ae41e77893ed9f2091f8a35ee2","bytes":13952,"triangles":128,"batches":2,"geometryBytes":12288,"size":[0.9799999594688416,0.46000000834465027,0.4100000262260437],"radius":0.5311543895291386},{"icon":"cabinet","file":"kitchenCabinet.glb","originalFile":"furniture/Models/GLTF format/kitchenCabinet.glb","sourceSha256":"7238c57778935ae25db5e57e9f7af3ba7068c71b005ff7cfbff3b6f3b1a13200","sha256":"0f9b3693f3de853fa68148bb71c9e29ecf38e784bfa7e39a7fb3cc78f76ce972","bytes":12604,"triangles":114,"batches":2,"geometryBytes":10944,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"stove","file":"kitchenStove.glb","originalFile":"furniture/Models/GLTF format/kitchenStove.glb","sourceSha256":"3239edb36295dfca9530a9b9a6ad0aff98ce62e7cf8d13ca2a5a1a6b2a904656","sha256":"6d1deee24fa30890cbfc540fa6e711fce2ab68cc82d0b68e104074c2c161b170","bytes":81356,"triangles":830,"batches":2,"geometryBytes":79680,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"refrigerator","file":"kitchenFridge.glb","originalFile":"furniture/Models/GLTF format/kitchenFridge.glb","sourceSha256":"8af4f4bbb1b5525ad8226e97926a5af60fa8fb20a3cb74dbda5328a9d320dbab","sha256":"69be9a8c3d3a804c494b92220710c61a2f87a4c3600922d0da3d5020eb3aef4c","bytes":25668,"triangles":250,"batches":2,"geometryBytes":24000,"size":[0.4300000071525574,0.9200000166893005,0.29193389415740967],"radius":0.2598679494998898},{"icon":"sink","file":"kitchenSink.glb","originalFile":"furniture/Models/GLTF format/kitchenSink.glb","sourceSha256":"7b9610277d71f00dcf1bba49cf4d98d77ce5177e84bf76c7da2f8893e542f743","sha256":"7063bb1597aae39279a3430952338d6f72fe8bccba5b93b143b930ba992f3878","bytes":32196,"triangles":318,"batches":2,"geometryBytes":30528,"size":[0.4300000071525574,0.4899999797344208,0.44999998807907104],"radius":0.3112073245532484},{"icon":"toilet","file":"toilet.glb","originalFile":"furniture/Models/GLTF format/toilet.glb","sourceSha256":"16165cfd03c56c2cb443b800570810a22ef770f65e7a468f6761d9dc14eaaeae","sha256":"42fcec7b0b225b544dcf05bde35f17e598cdf01c8f5f15f36aa55c76ab91652f","bytes":23732,"triangles":230,"batches":2,"geometryBytes":22080,"size":[0.31255000829696655,0.450965017080307,0.4771767109632492],"radius":0.2827908769988002},{"icon":"bathtub","file":"bathtub.glb","originalFile":"furniture/Models/GLTF format/bathtub.glb","sourceSha256":"54c405c7035aab63dc41e709dc3c50fc5bcfbc4cddc91ffc54188075a6d25d01","sha256":"f15e3a3316060b4ddca2dd1350109adc26bc11f1a4784e8dcb23465ccdb3cb5a","bytes":59480,"triangles":602,"batches":2,"geometryBytes":57792,"size":[0.5600000023841858,0.41999998688697815,1.190000057220459],"radius":0.6478308291120068},{"icon":"potted-plant","file":"pottedPlant.glb","originalFile":"furniture/Models/GLTF format/pottedPlant.glb","sourceSha256":"5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15","sha256":"d6be69190662ff9b0388b7332f9a8d8e0530d1373b5a3c08deea336ea09613e7","bytes":7420,"triangles":60,"batches":2,"geometryBytes":5760,"size":[0.21205927431583405,0.6540167927742004,0.24146194756031036],"radius":0.12073097378015518},{"icon":"light","file":"lampRoundFloor.glb","originalFile":"furniture/Models/GLTF format/lampRoundFloor.glb","sourceSha256":"50fe1b5b588edf15bfa9cc880f71a02a4fda6036350b24733d0ef4de5cc5e908","sha256":"f663a0f42fc9277cfc365f4ccc335fe8a80d621159dae74922dd8c3947fd2b36","bytes":8956,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.15203941613435745,0.8600000143051147,0.17555999755859375],"radius":0.08778000315811903},{"icon":"statue","file":"statue_ring.glb","originalFile":"nature/Models/GLTF format/statue_ring.glb","sourceSha256":"5c62e4165f7a76436faa0b20e98b47d0a9e5021dcbf2a0eef0cdf0912180f02c","sha256":"013b58818fbebae606f6cb9b5bc7f769ac6f55dbf5bc1c486787078a8761d29c","bytes":8976,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.6000000238418579,0.7964101441204547,0.4000000059604645],"radius":0.3605551391183468},{"icon":"chest","file":"chest.glb","originalFile":"survival/Models/GLB format/chest.glb","sourceSha256":"84b03023e425cc1f96c6d0b0f352608be9e8e01b112790e6b00b8651bf84379b","sha256":"dfaf5cf144a7465e313e87d08eb82b0039202500256a6e89f774d0a1e9c35946","bytes":32580,"triangles":322,"batches":2,"geometryBytes":30912,"size":[0.2603999972343445,0.2571914792060852,0.2720249891281128],"radius":0.18828552338788324},{"icon":"barrel","file":"barrel.glb","originalFile":"survival/Models/GLB format/barrel.glb","sourceSha256":"3a0d12f6bdd1badd361f64ce0fbbf878a4ccfc2de8ff1ac4ed4c1aea2a9ee04a","sha256":"3b1f6cdf0e406cdf9630649a1eca8bdf8428a9f07d794bafd70406e63dafa6e3","bytes":41228,"triangles":412,"batches":2,"geometryBytes":39552,"size":[0.23649999499320984,0.3440000116825104,0.23649999499320984],"radius":0.13364122923364707},{"icon":"tent","file":"tent-canvas.glb","originalFile":"survival/Models/GLB format/tent-canvas.glb","sourceSha256":"efc4bca46a22e4cc4fe391aeafba161c24bc39bfa75e192c57eaacaf686f9717","sha256":"8baaab74d57cfa38d73963dccd6fe711006d28ebef0145a410494625f4cc0b9d","bytes":15868,"triangles":148,"batches":2,"geometryBytes":14208,"size":[0.5607622265815735,0.4913683533668518,0.5610000491142273],"radius":0.37933337775768333},{"icon":"car","file":"sedan.glb","originalFile":"car/Models/GLB format/sedan.glb","sourceSha256":"b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7","sha256":"99b2d9141e842d542c406b83a3f8701519cad9f5a4f4d046b7b0d6f8cf12c0f8","bytes":197452,"triangles":2032,"batches":3,"geometryBytes":195072,"size":[1.5,1.2999999523162844,2.549999952316284],"radius":1.3472214803586575}]'), us = new Map(fs.map((t) => [t.icon, {
  size: new P().fromArray(t.size),
  radius: t.radius
}])), Ft = {
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
function Vt(t) {
  if (st(t) || ["wall", "grid"].includes(t.category) || !t.icon || !Object.hasOwn(Ft, t.icon)) return;
  const s = t.icon;
  if (t.shape === "circle") return ps.has(s) ? s : void 0;
  if (t.shape !== "rect") return;
  const { width: e, height: a } = Nt(t), n = e / a, [i, o] = Ft[s];
  return n >= i && n <= o ? s : void 0;
}
function qt(t, s, { size: e, radius: a }, n, i) {
  const o = s === "shelf" ? Math.max(1, Math.ceil(n / i / (e.x / e.z))) : 1, r = Math.min((s === "tree" ? 3 : 2.5) / e.y, t.shape === "circle" ? n / (2 * a) : Math.min(n / o / e.x, i / e.z));
  return {
    count: o,
    scale: r,
    height: e.y * r
  };
}
function bs(t, s, e, a) {
  return qt(t, s, us.get(s), e, a).height;
}
function gs(t, s, e, a, n, i, o, r) {
  const { size: l } = a, { count: f, scale: h, height: c } = qt(s, e, a, n, i), p = s.material ? s : {
    ...s,
    material: ms[e] || "unknown"
  };
  for (const b of a.parts) {
    const g = o.own(b.geometry.clone());
    if (g.scale(h, h, h), e === "table") {
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
    const v = b.role === "detail" ? e === "car" ? -0.78 : -0.25 : b.role === "bark" ? -0.22 : b.role === "window" ? -0.3 : b.role === "soft" ? 0.12 : 0, M = e === "light" && b.role === "shade" ? r.lampShade(s, v) : r.mesh(y, v), _ = o.own(new J(g, M, f));
    for (let m = 0; m < f; m++) _.setMatrixAt(m, new q().makeTranslation((m - (f - 1) / 2) * l.x * h, 0, 0));
    const d = e === "light" && b.role === "shade" && M.emissiveIntensity > 0 && M.emissive.getHex() !== 0;
    _.castShadow = M.opacity >= 0.8 && !d, _.receiveShadow = !0, t.add(_);
  }
  return c;
}
function ys(t, s, e, a, n, i) {
  const o = Xt(s, e), r = [], l = Math.max(0.45, o.reduce((c, p) => c + p.length, 0) / 128);
  let f = 0;
  for (const c of o) {
    for (const p of [0.22, 0.5]) r.push(new q().makeRotationY(c.rotation).scale(new P(c.length, 0.045, 0.04)).setPosition(c.x, p, c.z));
    for (; f <= c.length; ) {
      const p = f - c.length / 2;
      r.push(new q().makeScale(0.065, 0.58, 0.065).setPosition(c.x + Math.cos(c.rotation) * p, 0.29, c.z - Math.sin(c.rotation) * p)), f += l;
    }
    f -= c.length;
  }
  if (!e && s.length) {
    const c = s.at(-1);
    r.push(new q().makeScale(0.065, 0.58, 0.065).setPosition(c.x, 0.29, c.y));
  }
  const h = i.own(new J(a, n, r.length));
  return r.forEach((c, p) => h.setMatrixAt(p, c)), h.castShadow = n.opacity >= 0.8, h.receiveShadow = !0, t.add(h), 0.58;
}
function _t(t, s, e = 10) {
  const a = [], n = [], i = [], o = new P(0, 1, 0);
  t.forEach((l, f) => {
    const h = t[Math.min(f + 1, t.length - 1)].clone().sub(t[Math.max(0, f - 1)]).normalize(), c = new P().crossVectors(h, Math.abs(h.y) > 0.95 ? new P(1, 0, 0) : o).normalize(), p = new P().crossVectors(h, c).normalize(), b = f / (t.length - 1), g = s(b);
    for (let y = 0; y <= e; y++) {
      const v = y / e * Math.PI * 2, M = l.clone().addScaledVector(c, Math.cos(v) * g).addScaledVector(p, Math.sin(v) * g);
      if (a.push(M.x, M.y, M.z), i.push(y / e, b), f && y < e) {
        const _ = (f - 1) * (e + 1) + y, d = f * (e + 1) + y;
        n.push(_, d, _ + 1, d, d + 1, _ + 1);
      }
    }
  });
  for (const l of [0, t.length - 1]) {
    const f = a.length / 3, h = t[l], c = l * (e + 1);
    a.push(h.x, h.y, h.z), i.push(0.5, l ? 1 : 0);
    for (let p = 0; p < e; p++) n.push(f, c + p + (l ? 0 : 1), c + p + (l ? 1 : 0));
  }
  const r = new dt();
  return r.setAttribute("position", new ct(a, 3)), r.setAttribute("uv", new ct(i, 2)), r.setIndex(n), r.computeVertexNormals(), r;
}
function ws(t, s, e, a, n) {
  const i = s.icon, o = Ut(s), r = e.filter((y, v) => !v || !y.equals(e[v - 1]));
  if (r.length < 2) return 0;
  const l = [0];
  for (let y = 1; y < r.length; y++) l.push(l[y - 1] + r[y].distanceTo(r[y - 1]));
  const f = l[l.length - 1], h = Math.min(i === "tentacle" ? 0.22 : 0.09, Math.max(0.025, f * 0.035)), c = (y) => i === "pipe" ? h : h * (0.08 + 0.92 * (1 - y) ** 0.7), p = r.map((y, v) => c(v / (r.length - 1))), b = r.map((y, v) => {
    const M = v / (r.length - 1);
    return new P(y.x, p[v] + (i === "tentacle" ? Math.sin(M * Math.PI) * h * 1.6 : 0), y.y);
  }), g = new Y(a.own(_t(b, c)), n.mesh({
    ...s,
    material: o
  }));
  if (g.castShadow = g.receiveShadow = !0, t.add(g), i === "vine" || i === "tentacle") {
    const y = Math.min(24, Math.max(2, Math.floor(f * 3))), v = a.own(new Mt(1, 8, 6)), M = a.own(new J(v, n.mesh({
      ...s,
      material: o
    }, i === "vine" ? 0.12 : 0.3), y));
    let _ = 0;
    for (let d = 0; d < y; d++) {
      const m = (d + 0.5) / y * f;
      for (; _ < r.length - 2 && l[_ + 1] < m; ) _++;
      const w = (m - l[_]) / (l[_ + 1] - l[_]), x = b[_].clone().lerp(b[_ + 1], w), u = p[_] + (p[_ + 1] - p[_]) * w, O = d % 2 ? -1 : 1, z = r[_ + 1].clone().sub(r[_]).normalize();
      x.add(new P(z.y, 0, -z.x).multiplyScalar(i === "vine" ? O * u * 1.2 : 0)), x.y += u * 0.65;
      const j = new wt().setFromAxisAngle(new P(0, 1, 0), Math.atan2(z.x, z.y) + O * 0.75), B = i === "vine" ? new P(u * 2.1, u * 0.3, u * 0.8) : new P(u * 0.5, u * 0.28, u * 0.55);
      M.setMatrixAt(d, new q().compose(x, j, B));
    }
    M.castShadow = M.receiveShadow = !0, t.add(M);
  }
  return Math.max(...b.map((y) => y.y)) + h;
}
function _s(t, s) {
  const e = t.own(new Mt(1, 20, 14)), a = t.own(new Gt(1, 1, 6)), n = t.own(new Et(1, 1, 1, 12)), i = t.own(new Yt(1, 0)), o = /* @__PURE__ */ new Map();
  return (r, l, f, h) => {
    const c = l.icon, p = Ut(l), b = `${c}:${p}:${l.certainty}:${l.category}`;
    if (!o.has(b)) {
      let x = function(T, A, S, F, N, k, D, R = 0, I = p) {
        const U = new Y(T, s.mesh({
          ...l,
          material: I
        }, R));
        return U.position.set(A, S, F), U.scale.set(N, k, D), U.castShadow = U.material.opacity >= 0.8, U.receiveShadow = !0, w.add(U), U;
      }, u = function(T, A, S, F) {
        for (const N of [-1, 1]) x(e, N * T, A, S, F, F * 1.4, F * 0.65, -0.92, "stone");
      };
      const w = new mt();
      if (c === "slime")
        x(e, 0, 0.25, 0, 0.47, 0.25, 0.45), x(e, -0.04, 0.48, -0.03, 0.34, 0.38, 0.33, 0.06), u(0.105, 0.49, 0.29, 0.028);
      else if (c === "mushroom") {
        x(n, 0, 0.34, 0, 0.105, 0.68, 0.1, 0.25, "wood"), x(e, 0, 0.65, 0, 0.5, 0.22, 0.48), x(e, 0, 0.6, 0, 0.46, 0.04, 0.44, 0.45, "fabric");
        for (const [T, A, S] of [
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
        ]) x(e, T, 0.82 - (T * T + A * A) * 0.48, A, S, 0.022, S, 0.65);
      } else if (c === "crystal")
        x(i, 0, 0.62, 0, 0.23, 0.64, 0.24, 0.05).rotation.z = -0.12, x(i, -0.28, 0.3, 0.14, 0.13, 0.38, 0.15, -0.13).rotation.z = 0.3, x(i, 0.27, 0.26, -0.05, 0.15, 0.34, 0.17, 0.12).rotation.z = -0.36;
      else if (c === "dragon") {
        x(e, 0, 0.35, 0.02, 0.16, 0.22, 0.28), x(e, 0, 0.62, 0.22, 0.095, 0.24, 0.11, 0.04).rotation.x = -0.3, x(e, 0, 0.84, 0.3, 0.12, 0.11, 0.18, 0.12), x(e, 0, 0.79, 0.41, 0.085, 0.05, 0.13, 0.2);
        for (const A of [-1, 1]) {
          for (const R of [-0.13, 0.21]) x(e, A * 0.15, 0.15, R, 0.065, 0.16, 0.065, -0.08);
          x(a, A * 0.08, 0.99, 0.23, 0.035, 0.2, 0.045, 0.35, "wood").rotation.z = -A * 0.3;
          const S = [
            new P(A * 0.1, 0.46, -0.06),
            new P(A * 0.26, 0.7, -0.24),
            new P(A * 0.47, 0.85, -0.26)
          ], F = new Y(t.own(_t(S, (R) => 0.022 * (1 - R * 0.8), 6)), s.mesh({
            ...l,
            material: p
          }, 0.2));
          w.add(F);
          const N = t.own(new dt()), k = [
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
          N.setAttribute("position", new ct(k.flatMap(([R, I, U]) => [
            A * R,
            I,
            U
          ]), 3)), N.setAttribute("uv", new ct(k.flatMap(([R, , I]) => [R, I]), 2)), N.setIndex([
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
        const T = t.own(_t([
          new P(0, 0.27, -0.16),
          new P(0.12, 0.13, -0.3),
          new P(0.29, 0.08, -0.42),
          new P(0.37, 0.04, -0.33)
        ], (A) => 0.09 * (1 - A) + 5e-3));
        w.add(new Y(T, s.mesh({
          ...l,
          material: p
        }))), u(0.075, 0.87, 0.43, 0.016);
      } else {
        const T = c === "dwarf", A = T ? 0.3 : 0.19;
        x(a, 0, 0.46, 0, A, 0.66, A * 0.75, -0.04), x(e, 0, 0.89, 0, T ? 0.21 : 0.15, 0.21, 0.15, 0.38, "wood");
        for (const S of [-1, 1])
          x(n, S * A * 0.75, 0.14, 0.015, 0.055, 0.27, 0.07, -0.35, "wood"), x(e, S * A, 0.55, 0.015, 0.075, 0.23, 0.08, 0.06).rotation.z = S * 0.25;
        if (T)
          x(e, 0, 1.02, -5e-3, 0.225, 0.14, 0.18, 0.1, "metal"), x(a, 0, 0.71, 0.16, 0.18, 0.37, 0.12, -0.2, "wood").rotation.z = Math.PI, x(n, 0, 0.5, 0, 0.3, 0.07, 0.235, -0.25, "wood");
        else {
          for (const S of [-1, 1]) x(a, S * 0.19, 0.94, 0, 0.06, 0.23, 0.035, 0.38, "wood").rotation.z = -S * 1.1;
          x(e, 0, 1.02, -0.05, 0.17, 0.1, 0.15, -0.28, "wood");
        }
        u(0.06, 0.9, 0.135, 0.015);
      }
      w.updateMatrixWorld(!0);
      const O = /* @__PURE__ */ new Map();
      w.traverse((T) => {
        if (!(T instanceof Y)) return;
        const A = T.material, S = T.geometry.index ? T.geometry.toNonIndexed() : T.geometry.clone();
        S.applyMatrix4(T.matrixWorld), O.has(A) || O.set(A, []), O.get(A).push(S);
      }), w.clear();
      for (const [T, A] of O) {
        let S;
        try {
          S = Ue(A);
        } finally {
          A.forEach((N) => N.dispose());
        }
        if (!S) throw new Error("map_sculpture_geometry_invalid");
        const F = new Y(t.own(S), T);
        F.castShadow = T.opacity >= 0.8, F.receiveShadow = !0, w.add(F);
      }
      const z = new et().setFromObject(w), j = z.getCenter(new P());
      let B = 0;
      w.traverse((T) => {
        if (!(T instanceof Y)) return;
        const A = T.geometry.getAttribute("position");
        for (let S = 0; S < A.count; S++) {
          const F = new P().fromBufferAttribute(A, S).sub(j);
          B = Math.max(B, Math.hypot(F.x, F.z));
        }
      }), o.set(b, {
        group: w,
        box: z,
        radius: B
      });
    }
    const g = o.get(b), y = g.group.clone(!0), { box: v, radius: M } = g, _ = v.getSize(new P()), d = v.getCenter(new P()), m = Math.min(f / _.x, h / _.z, 2.8 / _.y, l.shape === "circle" ? f / (2 * M) : 1 / 0);
    return y.scale.setScalar(m), y.position.set(-d.x * m, -v.min.y * m, -d.z * m), r.add(y), _.y * m;
  };
}
function xs(t) {
  const e = new Uint8Array(9216);
  for (let r = 0; r < 48; r++) for (let l = 0; l < 48; l++) {
    const f = Math.hypot((l + 0.5) / 48 * 2 - 1, (r + 0.5) / 48 * 2 - 1);
    e[(r * 48 + l) * 4 + 3] = Math.round(Math.max(0, 1 - f) ** 1.5 * 120);
  }
  const a = t.own(new vt(e, 48, 48, Pt));
  a.magFilter = a.minFilter = St, a.needsUpdate = !0;
  const n = t.own(new Ae(0.5, 32).rotateX(-Math.PI / 2)), i = /* @__PURE__ */ new Map();
  let o = 0;
  return (r, l, f, h) => {
    if (o++ >= 96) return;
    i.has(h) || i.set(h, t.own(new Oe({
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
function Ms(t, s) {
  let e = !1;
  for (let a = 0, n = s.length - 1; a < s.length; n = a++) {
    const i = s[a], o = s[n];
    i.y > t.y != o.y > t.y && t.x < (o.x - i.x) * (t.y - i.y) / (o.y - i.y) + i.x && (e = !e);
  }
  return e;
}
function Ss(t, s, e, a = es(t)) {
  const n = new $t(), i = new mt();
  try {
    const o = ls(n, s, t.lighting), r = ds(n, o), l = _s(n, o), f = xs(n), h = n.own(new Ht(1, 1, 1)), c = n.own(new Yt(0.5, 1)), p = n.own(new Et(0.055, 0.08, 1, 6)), b = le(t.elements), g = /* @__PURE__ */ new Map(), y = /* @__PURE__ */ new Map(), v = [], M = new et();
    for (const [d, m] of me(t.elements).entries()) {
      const w = ss(m, a.scale), x = new mt();
      let u = 0.015, O = !1;
      const z = ts(m), j = de(m), B = be(m), T = Vt(m), A = T && e?.get(T), S = m.icon === "fence" && ["path", "curve"].includes(m.shape) && !st(m) && !["wall", "grid"].includes(m.category), F = !z && !st(m) && Lt(m) && (fe(m) || ["furniture", "decoration"].includes(m.category));
      if (m.shape === "icon" || m.shape === "label") u = 0.08;
      else if (m.category === "wall") {
        u = 1.1;
        const k = Xt(w.points, w.closed), D = n.own(new J(h, o.mesh(m, 0.12), k.length));
        D.castShadow = D.receiveShadow = !0, x.add(D), k.forEach((R, I) => {
          const U = new q().makeRotationY(R.rotation).scale(new P(R.length, u, 0.08)).setPosition(R.x, u / 2, R.z);
          D.setMatrixAt(I, U);
        }), v.push(D);
      } else if (S) u = ys(x, w.points, w.closed, h, o.mesh(m), n);
      else if (B) u = ws(x, m, w.points, n, o);
      else if (j) u = l(x, m, w.width, w.depth);
      else if (T && A) u = gs(x, m, T, A, w.width, w.depth, n, o);
      else if (z) u = r(x, m, z, w.width, w.depth);
      else if (Lt(m)) {
        u = F ? 0.2 : 0.015;
        const k = m.category === "terrain" ? 0.14 : u, D = n.own(os(w.points, k));
        D.translate(0, u - k, 0);
        const R = new Y(D, m.category === "terrain" && !F ? o.ground(m) : o.mesh(m));
        R.castShadow = u > 0.1, R.receiveShadow = !0, x.add(R);
      } else if (m.category === "road" || m.category === "water") {
        const k = new Y(n.own(is(w.points, w.closed, m.category === "road" ? 0.16 : 0.08).translate(0, u, 0)), o.mesh(m));
        k.receiveShadow = !0, x.add(k);
      }
      if (z || A || j) {
        const k = new et().setFromObject(x), D = Math.max(w.width, w.depth) * 1e-6;
        O = k.min.x > -w.width / 2 + D || k.max.x < w.width / 2 - D || k.min.z > -w.depth / 2 + D || k.max.z < w.depth / 2 - D;
      }
      if ((z || A || j) && w.width > 0 && w.depth > 0 && f(x, w.width, w.depth, ht(m, "").opacity), w.points.length && !B && (O || !z && !A && !j)) {
        const k = new je(n.own(as(w.points, w.closed, O ? 0.019 : m.category === "wall" ? 0.012 : u + 4e-3)), o.line(m));
        k.computeLineDistances(), x.add(k);
      }
      const N = (b.get(m.id) || []).flatMap((k) => {
        const D = new K((k.x - w.center[0]) / a.scale, (k.y - w.center[1]) / a.scale), R = k.size / a.scale / 2;
        return Array.from({ length: 8 }, (I, U) => new K(D.x + R * Math.cos(U * Math.PI / 4), D.y + R * Math.sin(U * Math.PI / 4))).every((I) => Ms(I, w.points)) ? [{
          center: D,
          radius: R
        }] : [];
      });
      if (N.length) {
        const k = new J(c, o.mesh(m, -0.03), N.length * 3), D = n.own(new J(p, o.mesh({
          ...m,
          material: "wood"
        }, -0.25), N.length));
        N.forEach(({ center: R, radius: I }, U) => {
          const H = I * 1.6;
          D.setMatrixAt(U, new q().makeScale(I, H, I).setPosition(R.x, H / 2 + u, R.y));
          for (let X = 0; X < 3; X++) {
            const ot = U * 3 + X, at = X === 0 ? 1.55 : 1.1;
            k.setMatrixAt(ot, new q().makeRotationY(U * 2.4 + X).scale(new P(I * at, I * at * 0.9, I * at)).setPosition(R.x + (X === 1 ? -0.3 : X === 2 ? 0.3 : 0) * I, u + I * (X === 0 ? 1.8 : 1.35), R.y)), k.setColorAt(ot, new yt().setScalar(0.84 + U % 5 * 0.03 + (X === 0 ? 0.08 : 0)));
          }
        }), k.castShadow = k.receiveShadow = !0, D.castShadow = D.receiveShadow = !0, n.own(k), x.add(D, k);
      }
      if (x.position.copy(a.point(...w.center, d * 2e-3)), x.rotation.y = w.rotation, i.add(x), T) {
        const k = bs(m, T, w.width, w.depth) + 0.1;
        x.updateMatrix(), M.union(new et(new P(-w.width / 2, 0, -w.depth / 2), new P(w.width / 2, k, w.depth / 2)).applyMatrix4(x.matrix));
      }
      st(m) ? (g.set(m.id, a.point(...w.center, x.position.y + 0.025)), j && y.set(m.id, a.point(...w.center, x.position.y + u + 0.06))) : z || T || F || j ? g.set(m.id, a.point(...w.center, x.position.y + u + 0.1)) : g.set(m.id, a.point(...he(m, 0), x.position.y + (S || B ? u : 0) + 0.1));
    }
    const _ = new et().setFromObject(i).union(M);
    for (const d of g.values()) _.expandByPoint(d);
    for (const d of y.values()) _.expandByPoint(d);
    return {
      group: i,
      anchors: g,
      markerTops: y,
      bounds: _,
      frame: a,
      updateWalls(d) {
        for (const m of v) m.scale.y = d ? 0.2 / 1.1 : 1;
      },
      dispose() {
        i.removeFromParent(), n.dispose(), i.clear();
      }
    };
  } catch (o) {
    throw n.dispose(), i.clear(), o;
  }
}
var jt = (t, s) => t.x < s.x + s.w + 3 && t.x + t.w + 3 > s.x && t.y < s.y + s.h + 3 && t.y + t.h + 3 > s.y;
function Es(t, s, e, a = []) {
  const n = /* @__PURE__ */ new Map(), i = [...t].sort((h, c) => h.priority - c.priority || h.id.localeCompare(c.id)), o = [...a], r = i.filter((h) => h.badge).map(({ anchor: h }) => ({
    x: h.x - 3,
    y: h.y - 3,
    w: 6,
    h: 6
  })), l = (h) => h.x >= 3 && h.y >= 3 && h.x + h.w <= s - 3 && h.y + h.h <= e - 3, f = (h) => l(h) && !o.some((c) => jt(h, c)) && !r.some((c) => jt(h, c));
  for (const h of i) {
    const c = { anchor: { ...h.anchor } };
    if (n.set(h.id, c), !h.badge) continue;
    const { w: p, h: b } = h.badge, { x: g, y } = h.badgeAnchor || h.anchor, v = [];
    for (const _ of [
      9,
      27,
      45
    ]) v.push({
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
    const M = v.map((_) => ({
      x: Math.max(3, Math.min(s - p - 3, _.x)),
      y: Math.max(3, Math.min(e - b - 3, _.y)),
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
function Ps(t, s, e, a) {
  const n = s.elements.filter((i) => i.label || st(i)).map((i) => {
    const o = st(i) && i.shape !== "label", r = i.actorKey === "player", l = r ? 0 : i.category === "door" ? 1 : i.category === "actor" ? 2 : o ? 3 : 4, f = i.label || re[i.category], h = document.createElement("span");
    h.className = `map-3d-label is-${i.category}${r ? " is-player" : ""}`, h.dataset.element = i.id, h.style.zIndex = String(10 - l), o && (h.setAttribute("role", "img"), h.setAttribute("aria-label", f));
    const c = ht(i, "");
    h.style.opacity = String(c.opacity);
    const p = document.createElement("span");
    p.className = "map-3d-glyph", p.setAttribute("aria-hidden", "true");
    const b = document.createElement("span");
    b.className = "map-3d-anchor", b.setAttribute("aria-hidden", "true");
    const g = document.createElement("span");
    g.className = "map-3d-leader", g.setAttribute("aria-hidden", "true"), o && h.append(g, b, p);
    const y = document.createElement("span");
    return y.textContent = f, y.className = "map-3d-label-text", o && y.setAttribute("aria-hidden", "true"), h.append(y), t.append(h), {
      element: i,
      node: h,
      glyph: p,
      dot: b,
      leader: g,
      caption: y,
      recipe: c,
      hasGlyph: o,
      priority: l,
      anchor: e.get(i.id)
    };
  });
  return {
    symbols(i) {
      for (const o of n) {
        const r = we(o.element.icon);
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
      for (const { element: b, node: g, caption: y, glyph: v, anchor: M, hasGlyph: _, priority: d } of n) {
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
            w: v.offsetWidth,
            h: v.offsetHeight
          } : void 0,
          caption: l ? {
            w: y.offsetWidth,
            h: y.offsetHeight
          } : void 0
        });
      }
      const h = t.parentElement?.querySelector(".map-viewport-controls")?.getBoundingClientRect(), c = t.getBoundingClientRect(), p = Es(f, o, r, h ? [{
        x: h.x - c.x,
        y: h.y - c.y,
        w: h.width,
        h: h.height
      }] : []);
      for (const { element: b, node: g, caption: y, dot: v, leader: M } of n) {
        const _ = p.get(b.id), d = _?.badge || _?.caption;
        if (y.style.visibility = _?.caption ? "inherit" : "hidden", !(!_ || !d) && (g.style.visibility = "visible", g.style.transform = `translate(${d.x}px, ${d.y}px)`, g.style.width = `${d.w}px`, g.style.height = `${d.h}px`, _.caption && (y.style.left = `${_.caption.x - d.x}px`, y.style.top = `${_.caption.y - d.y}px`), _.badge)) {
          const m = _.anchor.x - d.x, w = _.anchor.y - d.y;
          v.style.transform = `translate(${m}px, ${w}px)`;
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
async function vs(t) {
  const { scene: s } = await new Ne().parseAsync(t, ""), e = new $t(), a = [], n = new et().setFromObject(s).getSize(new P());
  let i = 0;
  return s.traverse((o) => {
    if (!(o instanceof Y)) return;
    e.own(o.geometry);
    const r = Array.isArray(o.material) ? o.material : [o.material];
    r.forEach((f) => e.own(f)), a.push({
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
      e.dispose(), s.clear();
    }
  };
}
function As(t, s, e) {
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
        a.set(h, c), t(h, c.abort.signal).then((p) => {
          if (a.get(h) !== c) {
            p.dispose();
            return;
          }
          c.asset = p, c.settled = !0, i = !0, o();
        }, (p) => {
          c.settled = !0, a.get(h) === c && e(h, p), o();
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
var Ts = "" + new URL("map-assets/table-BYH2YAbI.glb", import.meta.url).href, Ls = "" + new URL("map-assets/chairRounded-CAXjIAhg.glb", import.meta.url).href, ks = "" + new URL("map-assets/bedSingle-DQi3T5hW.glb", import.meta.url).href, Rs = "" + new URL("map-assets/bookcaseOpenLow-D5KCefka.glb", import.meta.url).href, Ds = "" + new URL("map-assets/tree_oak-BfHnIhp4.glb", import.meta.url).href, zs = "" + new URL("map-assets/stone_largeE-BlCexUuF.glb", import.meta.url).href, Os = "" + new URL("map-assets/stoolBar-K3cU9Dzt.glb", import.meta.url).href, Cs = "" + new URL("map-assets/bench-Bgad_ueP.glb", import.meta.url).href, Fs = "" + new URL("map-assets/loungeSofa-B4ImPSPA.glb", import.meta.url).href, js = "" + new URL("map-assets/kitchenCabinet-DDG9MLaC.glb", import.meta.url).href, Us = "" + new URL("map-assets/chest-5wu5Viff.glb", import.meta.url).href, Ns = "" + new URL("map-assets/barrel-CTYVDd_z.glb", import.meta.url).href, Is = "" + new URL("map-assets/kitchenStove-RyR0iXNj.glb", import.meta.url).href, Bs = "" + new URL("map-assets/kitchenFridge-DWiEo7GA.glb", import.meta.url).href, Gs = "" + new URL("map-assets/kitchenSink-BX1FOFLO.glb", import.meta.url).href, Ys = "" + new URL("map-assets/toilet-Lah8VaC1.glb", import.meta.url).href, Ks = "" + new URL("map-assets/bathtub-CbRYKtGX.glb", import.meta.url).href, Hs = "" + new URL("map-assets/sedan-CvNIPylJ.glb", import.meta.url).href, Ws = "" + new URL("map-assets/statue_ring-MbjedqWU.glb", import.meta.url).href, Zs = "" + new URL("map-assets/tent-canvas-DmLjTNyB.glb", import.meta.url).href, Xs = "" + new URL("map-assets/pottedPlant-B8kIu3Qg.glb", import.meta.url).href, $s = "" + new URL("map-assets/lampRoundFloor-DO1FJkPg.glb", import.meta.url).href, Vs = {
  table: Ts,
  chair: Ls,
  bed: ks,
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
  bathtub: Ks,
  car: Hs,
  statue: Ws,
  tent: Zs,
  "potted-plant": Xs,
  light: $s
};
function qs(t) {
  const s = pt(), e = new xe(s.sky.color, s.ground, s.sky.intensity), a = new kt(s.key.color, s.key.intensity), n = new kt(s.fill.color, s.fill.intensity), i = [];
  a.shadow.mapSize.set(1024, 1024), a.shadow.normalBias = 0.012, a.shadow.bias = -15e-5, a.shadow.radius = 2, t.add(e, a, a.target, n);
  function o() {
    const r = i.pop();
    r.removeFromParent(), r.dispose();
  }
  return {
    update(r, l, f, h) {
      const c = pt(r.lighting);
      e.color.set(c.sky.color), e.groundColor.set(c.ground), e.intensity = c.sky.intensity, a.color.set(c.key.color), a.intensity = c.key.intensity, a.castShadow = c.shadows, n.color.set(c.fill.color), n.intensity = c.fill.intensity;
      const p = f.getCenter(new P()), b = Math.max(1, f.getSize(new P()).length()), g = r.lighting ? new P(...ue) : new P(-0.5, 1, 0.5);
      a.position.copy(p).add(g.multiplyScalar(b)), a.target.position.copy(p), n.position.copy(p).add(new P(b, b / 2, -b)), a.updateMatrixWorld(!0), a.target.updateMatrixWorld(!0), a.shadow.updateMatrices(a);
      const y = f.clone().applyMatrix4(a.shadow.camera.matrixWorldInverse);
      Object.assign(a.shadow.camera, {
        left: y.min.x - 0.3,
        right: y.max.x + 0.3,
        top: y.max.y + 0.3,
        bottom: y.min.y - 0.3,
        near: Math.max(0.01, -y.max.z - 1),
        far: -y.min.z + 1
      }), a.shadow.camera.updateProjectionMatrix(), a.shadow.needsUpdate = !0;
      const v = pe(r);
      for (; i.length > v.length; ) o();
      v.forEach((M, _) => {
        let d = i[_];
        d || (d = new Kt(), i.push(d), t.add(d), d.shadow.mapSize.set(512, 512), d.shadow.normalBias = 0.025, d.shadow.bias = -2e-4, d.shadow.radius = 2, d.shadow.autoUpdate = !1);
        const m = M.radius / l.scale, w = M.overhead ? Math.max(2.2, m * 0.44) : Math.max(1, h.get(M.id)?.y || 0);
        d.color.set(M.color), d.position.copy(l.point(M.x, M.y, w)), d.distance = Math.hypot(m, w), d.decay = 2, d.intensity = w * w * (M.overhead ? 6 : 9), d.castShadow = _ < 1, d.shadow.camera.near = 0.08, d.shadow.camera.far = d.distance, d.shadow.camera.updateProjectionMatrix(), d.shadow.needsUpdate = !0;
      });
    },
    invalidateShadows() {
      for (const r of i) r.shadow.needsUpdate = !0;
    },
    dispose() {
      for (; i.length; ) o();
      a.dispose(), a.removeFromParent(), a.target.removeFromParent(), e.removeFromParent(), n.removeFromParent();
    }
  };
}
var Qs = class extends It {
  constructor() {
    super();
    const t = new Ht();
    t.deleteAttribute("uv");
    const s = new Rt({ side: 1 }), e = new Rt(), a = new Kt(16777215, 900, 28, 2);
    a.position.set(0.418, 16.199, 0.3), this.add(a);
    const n = new Y(t, s);
    n.position.set(-0.757, 13.219, 0.717), n.scale.set(31.713, 28.305, 28.591), this.add(n);
    const i = new J(t, e, 6), o = new Ce();
    o.position.set(-10.906, 2.009, 1.846), o.rotation.set(0, -0.195, 0), o.scale.set(2.328, 7.905, 4.651), o.updateMatrix(), i.setMatrixAt(0, o.matrix), o.position.set(-5.607, -0.754, -0.758), o.rotation.set(0, 0.994, 0), o.scale.set(1.97, 1.534, 3.955), o.updateMatrix(), i.setMatrixAt(1, o.matrix), o.position.set(6.167, 0.857, 7.803), o.rotation.set(0, 0.561, 0), o.scale.set(3.927, 6.285, 3.687), o.updateMatrix(), i.setMatrixAt(2, o.matrix), o.position.set(-2.017, 0.018, 6.124), o.rotation.set(0, 0.333, 0), o.scale.set(2.002, 4.566, 2.064), o.updateMatrix(), i.setMatrixAt(3, o.matrix), o.position.set(2.291, -0.756, -2.621), o.rotation.set(0, -0.286, 0), o.scale.set(1.546, 1.552, 1.496), o.updateMatrix(), i.setMatrixAt(4, o.matrix), o.position.set(-2.193, -0.369, -5.547), o.rotation.set(0, 0.516, 0), o.scale.set(3.875, 3.487, 2.986), o.updateMatrix(), i.setMatrixAt(5, o.matrix), this.add(i);
    const r = new Y(t, nt(50));
    r.position.set(-16.116, 14.37, 8.208), r.scale.set(0.1, 2.428, 2.739), this.add(r);
    const l = new Y(t, nt(50));
    l.position.set(-16.109, 18.021, -8.207), l.scale.set(0.1, 2.425, 2.751), this.add(l);
    const f = new Y(t, nt(17));
    f.position.set(14.904, 12.198, -1.832), f.scale.set(0.15, 4.265, 6.331), this.add(f);
    const h = new Y(t, nt(43));
    h.position.set(-0.462, 8.89, 14.52), h.scale.set(4.38, 5.441, 0.088), this.add(h);
    const c = new Y(t, nt(20));
    c.position.set(3.235, 11.486, -12.541), c.scale.set(2.5, 2, 0.1), this.add(c);
    const p = new Y(t, nt(100));
    p.position.set(0, 20, 0), p.scale.set(1, 0.1, 1), this.add(p);
  }
  dispose() {
    const t = /* @__PURE__ */ new Set();
    this.traverse((s) => {
      s.isMesh && (t.add(s.geometry), t.add(s.material));
    });
    for (const s of t) s.dispose();
  }
};
function nt(t) {
  return new ke({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: t
  });
}
function Js(t, s) {
  const e = new ze(t), a = new Qs();
  let n;
  try {
    n = e.fromScene(a, 0.06, 0.1, 100, { size: 128 });
  } finally {
    a.dispose(), e.dispose();
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
function io(t, s, e) {
  let a, n, i, o, r, l, f, h, c, p, b = !1, g = !1, y = !0, v = 0, M = 0, _ = 0, d = !0, m = !1, w = !1, x, u = "", O = "", z = !1, j = 14, B = 14;
  const T = new AbortController(), A = new It(), S = new ve(-10, 10, 10, -10, 0.01, 1e3), F = new K(), N = qs(A), k = () => !!t.closest(".theme-dark");
  let D = k();
  function R() {
    v && (cancelAnimationFrame(v), v = 0);
  }
  function I() {
    b || (b = !0, R(), T.abort(), h?.disconnect(), c?.disconnect(), p?.disconnect(), i?.dispose(), n?.dispose(), l?.dispose(), o?.dispose(), r?.dispose(), N.dispose(), f?.dispose(), a?.dispose(), a?.forceContextLoss(), a?.domElement.remove(), A.clear());
  }
  function U(L) {
    b || g || (g = !0, R(), e.fallback(L));
  }
  function H() {
    b || g || v || document.hidden || !t.isConnected || !y || M <= 0 || _ <= 0 || (v = requestAnimationFrame(() => {
      if (v = 0, !(document.hidden || !t.isConnected || !t.getClientRects().length))
        try {
          z && x && (z = !1, Qt(x)), a.getSize(F), (F.x !== M || F.y !== _) && a.setSize(M, _, !1), a.render(A, S), l?.update(S, M, _, d);
        } catch {
          U("三维画面暂不可用，已切换二维。");
        }
    }));
  }
  function X() {
    const [L, E, $, V] = x.viewBox, { frame: Z } = o;
    return new et(Z.point(L, E), Z.point(L + $, E + V)).union(o.bounds);
  }
  function ot() {
    if (!n || !o) return;
    const L = X(), E = L.getCenter(new P()), $ = Math.max(1, L.getSize(new P()).length());
    n.target.copy(E), S.position.copy(E).add(new P(9, 13, 15).normalize().multiplyScalar($ * 2)), S.near = $ / 1e3, S.far = $ * 6, S.lookAt(E), S.updateMatrixWorld(!0);
    let V = 0, Z = 0;
    for (const te of [L.min.x, L.max.x]) for (const ee of [L.min.y, L.max.y]) for (const se of [L.min.z, L.max.z]) {
      const Tt = new P(te, ee, se).applyMatrix4(S.matrixWorldInverse);
      V = Math.max(V, Math.abs(Tt.x)), Z = Math.max(Z, Math.abs(Tt.y));
    }
    j = V, B = Z;
    const tt = Math.max(B, j / (M / _ || 1)) * 1.09;
    S.top = tt, S.bottom = -tt, S.left = -tt * (M / _ || 1), S.right = -S.left, S.zoom = 1, S.updateProjectionMatrix(), n.update(), H();
  }
  function at() {
    if (b) return;
    const L = t.getBoundingClientRect();
    if (M = L.width, _ = L.height, M <= 0 || _ <= 0) {
      i?.cancel(), R();
      return;
    }
    S.top = Math.max(B, j / (M / _)) * 1.09, S.bottom = -S.top, S.left = -S.top * M / _, S.right = -S.left, S.updateProjectionMatrix(), H();
  }
  function Qt(L) {
    const E = O !== L.key, $ = E ? void 0 : o?.frame;
    l?.dispose(), l = void 0, o?.dispose(), o = void 0, E && (r?.dispose(), r = As(async (V, Z) => {
      const tt = await fetch(Vs[V], { signal: Z });
      if (!tt.ok) throw new Error(`HTTP ${tt.status}`);
      return vs(await tt.arrayBuffer());
    }, () => {
      z = !0, H();
    }, (V, Z) => console.warn(`[Map 3D] ${V}: keeping procedural shape`, Z))), o = Ss(L, D, r, $), O = L.key, A.add(o.group), o.updateWalls(m), l = Ps(s, L, o.anchors, o.markerTops), l.symbols(w), N.update(L, o.frame, X(), o.anchors), f?.update(L.lighting), E && ot(), r?.sync(L.elements.flatMap((V) => {
      const Z = Vt(V);
      return Z ? [Z] : [];
    }));
  }
  function Jt(L) {
    if (b || g) return;
    const E = JSON.stringify(L);
    E !== u && (u = E, x = L, z = !0, H());
  }
  function ft(L) {
    S.zoom = gt.clamp(S.zoom * L, 0.4, 6), S.updateProjectionMatrix(), H();
  }
  try {
    a = new Le({
      antialias: !0,
      alpha: !0,
      powerPreference: "low-power"
    }), a.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8)), a.setClearColor(0, 0), a.outputColorSpace = xt, a.toneMapping = 7, a.toneMappingExposure = 1.1, a.shadowMap.enabled = !0, a.shadowMap.type = 2, f = Js(a, A), a.debug.onShaderError = () => U("图形驱动无法绘制三维，已切换二维。");
    const L = a.domElement;
    L.setAttribute("aria-label", "三维场景：左键拖动旋转，Shift + 左键拖动平移，滚轮缩放；单指平移，双指拖动旋转、捏合缩放；方向键旋转，Home 全图"), L.title = "左键拖动旋转 · Shift + 左键拖动平移 · 滚轮缩放", L.setAttribute("role", "group"), L.tabIndex = 0, t.prepend(L), n = new Be(S, L), i = ae(L, (E) => {
      L.dispatchEvent(new PointerEvent("pointercancel", { pointerId: E }));
    }), n.mouseButtons.RIGHT = null, n.touches = {
      ONE: Q.PAN,
      TWO: Q.DOLLY_ROTATE
    }, n.enableDamping = !1, n.minPolarAngle = 0.08, n.maxPolarAngle = Math.PI * 0.46, n.minZoom = 0.4, n.maxZoom = 6, n.rotateSpeed = 0.65, n.zoomSpeed = 0.8, n.addEventListener("change", H), L.addEventListener("webglcontextlost", (E) => {
      E.preventDefault(), U("图形连接已中断，已切换二维。重新打开地图可重试。");
    }, { signal: T.signal }), L.addEventListener("keydown", (E) => {
      if (!(E.ctrlKey || E.metaKey || E.altKey)) {
        if (E.key === "Home") ot();
        else if (E.key === "+" || E.key === "=") ft(1.2);
        else if (E.key === "-") ft(1 / 1.2);
        else if ([
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ].includes(E.key)) {
          const $ = new bt().setFromVector3(S.position.clone().sub(n.target));
          $.theta += E.key === "ArrowLeft" ? -0.13 : E.key === "ArrowRight" ? 0.13 : 0, $.phi = gt.clamp($.phi + (E.key === "ArrowUp" ? -0.1 : E.key === "ArrowDown" ? 0.1 : 0), n.minPolarAngle, n.maxPolarAngle), S.position.copy(n.target).add(new P().setFromSpherical($)), n.update(), H();
        } else return;
        E.preventDefault();
      }
    }, { signal: T.signal }), h = new ResizeObserver(() => {
      try {
        at();
      } catch {
        U("三维画面尺寸调整失败，已切换二维。");
      }
    }), h.observe(t), at(), c = new IntersectionObserver((E) => {
      y = E[0].isIntersecting, y ? H() : R();
    }), c.observe(t), document.addEventListener("visibilitychange", () => {
      document.hidden ? R() : H();
    }, { signal: T.signal }), p = new MutationObserver(() => {
      const E = k();
      E !== D && (D = E, z = !0, H());
    });
    for (let E = t; E; E = E.parentElement) p.observe(E, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    return {
      dispose: I,
      setScene: Jt,
      fit: ot,
      zoom: ft,
      labels(E) {
        d = E, H();
      },
      walls(E) {
        m = E, o?.updateWalls(E), N.invalidateShadows(), H();
      },
      symbols(E) {
        w = E, l?.symbols(E), H();
      }
    };
  } catch (L) {
    throw I(), L;
  }
}
export {
  io as createThreeRuntime
};
