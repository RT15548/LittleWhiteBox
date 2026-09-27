/* eslint-disable */
import { $ as Oe, A as xt, At as Et, B as et, Ct as Mt, D as St, Dt as Rt, E as re, Et as At, F as vt, Ft as N, G as oe, H as Q, I as Lt, It as v, J as K, K as Te, L as Pt, Lt as Fe, Mt as Ue, N as Ot, Nt, O as Dt, Ot as tt, P as st, Q as Y, R as kt, S as It, St as Ct, T as Ft, Tt as Ut, U as jt, V as Ht, W as ue, X as he, Y as pe, _ as Gt, _t as Bt, a as te, at as nt, b as zt, c as Ne, ct as Kt, d as je, dt as Xt, et as Vt, f as Yt, ft as Wt, g as Re, gt as Zt, h as qt, ht as He, i as $t, it as Ge, j as it, jt as $, k as Qt, kt as Ae, l as Jt, m as es, mt as me, nt as ts, o as ss, ot, p as ns, pt as is, q as ge, r as os, rt as as, s as we, st as rs, t as cs, tt as ls, u as W, ut as hs, v as us, w as ds, x as de, xt as ne, y as at, yt as rt, z as ct } from "./xiaobai-os-three.module-DlsF37OG.js";
import { t as Be } from "./xiaobai-os-RoundedBoxGeometry-DfNp4gEJ.js";
import { _ as fs, a as ve, d as ps, f as lt, l as ze, m as ms, o as gs, p as bs, s as ys, t as _s, u as se } from "./xiaobai-os-map-presentation-CZH95z-i.js";
import { n as Ts, r as ws, t as ht } from "./xiaobai-os-resources-LQ2LTqLo.js";
var Ke = { type: "change" }, De = { type: "start" }, ut = { type: "end" }, fe = new Bt(), Xe = new Kt(), xs = Math.cos(70 * ge.DEG2RAD), k = new v(), j = 2 * Math.PI, P = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, xe = 1e-6, Es = class extends ns {
  constructor(e, t = null) {
    super(e, t), this.state = P.NONE, this.target = new v(), this.cursor = new v(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
      LEFT: "ArrowLeft",
      UP: "ArrowUp",
      RIGHT: "ArrowRight",
      BOTTOM: "ArrowDown"
    }, this.mouseButtons = {
      LEFT: oe.ROTATE,
      MIDDLE: oe.DOLLY,
      RIGHT: oe.PAN
    }, this.touches = {
      ONE: $.ROTATE,
      TWO: $.DOLLY_PAN
    }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new v(), this._lastQuaternion = new me(), this._lastTargetPosition = new v(), this._quat = new me().setFromUnitVectors(e.up, new v(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Ae(), this._sphericalDelta = new Ae(), this._scale = 1, this._panOffset = new v(), this._rotateStart = new N(), this._rotateEnd = new N(), this._rotateDelta = new N(), this._panStart = new N(), this._panEnd = new N(), this._panDelta = new N(), this._dollyStart = new N(), this._dollyEnd = new N(), this._dollyDelta = new N(), this._dollyDirection = new v(), this._mouse = new N(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Ss.bind(this), this._onPointerDown = Ms.bind(this), this._onPointerUp = Rs.bind(this), this._onContextMenu = Ds.bind(this), this._onMouseWheel = Ls.bind(this), this._onKeyDown = Ps.bind(this), this._onTouchStart = Os.bind(this), this._onTouchMove = Ns.bind(this), this._onMouseDown = As.bind(this), this._onMouseMove = vs.bind(this), this._interceptControlDown = ks.bind(this), this._interceptControlUp = Is.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(Ke), this.update(), this.state = P.NONE;
  }
  update(e = null) {
    const t = this.object.position;
    k.copy(t).sub(this.target), k.applyQuaternion(this._quat), this._spherical.setFromVector3(k), this.autoRotate && this.state === P.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let i = this.minAzimuthAngle, s = this.maxAzimuthAngle;
    isFinite(i) && isFinite(s) && (i < -Math.PI ? i += j : i > Math.PI && (i -= j), s < -Math.PI ? s += j : s > Math.PI && (s -= j), i <= s ? this._spherical.theta = Math.max(i, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (i + s) / 2 ? Math.max(i, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let n = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const o = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), n = o != this._spherical.radius;
    }
    if (k.setFromSpherical(this._spherical), k.applyQuaternion(this._quatInverse), t.copy(this.target).add(k), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let o = null;
      if (this.object.isPerspectiveCamera) {
        const a = k.length();
        o = this._clampDistance(a * this._scale);
        const r = a - o;
        this.object.position.addScaledVector(this._dollyDirection, r), this.object.updateMatrixWorld(), n = !!r;
      } else if (this.object.isOrthographicCamera) {
        const a = new v(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const r = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), n = r !== this.object.zoom;
        const h = new v(this._mouse.x, this._mouse.y, 0);
        h.unproject(this.object), this.object.position.sub(h).add(a), this.object.updateMatrixWorld(), o = k.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (fe.origin.copy(this.object.position), fe.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(fe.direction)) < xs ? this.object.lookAt(this.target) : (Xe.setFromNormalAndCoplanarPoint(this.object.up, this.target), fe.intersectPlane(Xe, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), n = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, n || this._lastPosition.distanceToSquared(this.object.position) > xe || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > xe || this._lastTargetPosition.distanceToSquared(this.target) > xe ? (this.dispatchEvent(Ke), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(e) {
    return e !== null ? j / 60 * this.autoRotateSpeed * e : j / 60 / 60 * this.autoRotateSpeed;
  }
  _getZoomScale(e) {
    const t = Math.abs(e * 0.01);
    return Math.pow(0.95, this.zoomSpeed * t);
  }
  _rotateLeft(e) {
    this._sphericalDelta.theta -= e;
  }
  _rotateUp(e) {
    this._sphericalDelta.phi -= e;
  }
  _panLeft(e, t) {
    k.setFromMatrixColumn(t, 0), k.multiplyScalar(-e), this._panOffset.add(k);
  }
  _panUp(e, t) {
    this.screenSpacePanning === !0 ? k.setFromMatrixColumn(t, 1) : (k.setFromMatrixColumn(t, 0), k.crossVectors(this.object.up, k)), k.multiplyScalar(e), this._panOffset.add(k);
  }
  _pan(e, t) {
    const i = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const s = this.object.position;
      k.copy(s).sub(this.target);
      let n = k.length();
      n *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * n / i.clientHeight, this.object.matrix), this._panUp(2 * t * n / i.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / i.clientWidth, this.object.matrix), this._panUp(t * (this.object.top - this.object.bottom) / this.object.zoom / i.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
  }
  _dollyOut(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale /= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _dollyIn(e) {
    this.object.isPerspectiveCamera || this.object.isOrthographicCamera ? this._scale *= e : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."), this.enableZoom = !1);
  }
  _updateZoomParameters(e, t) {
    if (!this.zoomToCursor) return;
    this._performCursorZoom = !0;
    const i = this.domElement.getBoundingClientRect(), s = e - i.left, n = t - i.top, o = i.width, a = i.height;
    this._mouse.x = s / o * 2 - 1, this._mouse.y = -(n / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
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
    const t = this.domElement;
    this._rotateLeft(j * this._rotateDelta.x / t.clientHeight), this._rotateUp(j * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
    let t = !1;
    switch (e.code) {
      case this.keys.UP:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(j * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
        break;
      case this.keys.BOTTOM:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-j * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
        break;
      case this.keys.LEFT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(j * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
        break;
      case this.keys.RIGHT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-j * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
        break;
    }
    t && (e.preventDefault(), this.update());
  }
  _handleTouchStartRotate(e) {
    if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), i = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._rotateStart.set(i, s);
    }
  }
  _handleTouchStartPan(e) {
    if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), i = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._panStart.set(i, s);
    }
  }
  _handleTouchStartDolly(e) {
    const t = this._getSecondPointerPosition(e), i = e.pageX - t.x, s = e.pageY - t.y, n = Math.sqrt(i * i + s * s);
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
      const i = this._getSecondPointerPosition(e), s = 0.5 * (e.pageX + i.x), n = 0.5 * (e.pageY + i.y);
      this._rotateEnd.set(s, n);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(j * this._rotateDelta.x / t.clientHeight), this._rotateUp(j * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(e) {
    if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), i = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._panEnd.set(i, s);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(e) {
    const t = this._getSecondPointerPosition(e), i = e.pageX - t.x, s = e.pageY - t.y, n = Math.sqrt(i * i + s * s);
    this._dollyEnd.set(0, n), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
    const o = (e.pageX + t.x) * 0.5, a = (e.pageY + t.y) * 0.5;
    this._updateZoomParameters(o, a);
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
    for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) {
      this._pointers.splice(t, 1);
      return;
    }
  }
  _isTrackingPointer(e) {
    for (let t = 0; t < this._pointers.length; t++) if (this._pointers[t] == e.pointerId) return !0;
    return !1;
  }
  _trackPointer(e) {
    let t = this._pointerPositions[e.pointerId];
    t === void 0 && (t = new N(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[t];
  }
  _customWheelEvent(e) {
    const t = e.deltaMode, i = {
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.deltaY
    };
    switch (t) {
      case 1:
        i.deltaY *= 16;
        break;
      case 2:
        i.deltaY *= 100;
        break;
    }
    return e.ctrlKey && !this._controlActive && (i.deltaY *= 10), i;
  }
};
function Ms(e) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e)));
}
function Ss(e) {
  this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function Rs(e) {
  switch (this._removePointer(e), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(e.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(ut), this.state = P.NONE;
      break;
    case 1:
      const t = this._pointers[0], i = this._pointerPositions[t];
      this._onTouchStart({
        pointerId: t,
        pageX: i.x,
        pageY: i.y
      });
      break;
  }
}
function As(e) {
  let t;
  switch (e.button) {
    case 0:
      t = this.mouseButtons.LEFT;
      break;
    case 1:
      t = this.mouseButtons.MIDDLE;
      break;
    case 2:
      t = this.mouseButtons.RIGHT;
      break;
    default:
      t = -1;
  }
  switch (t) {
    case oe.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(e), this.state = P.DOLLY;
      break;
    case oe.ROTATE:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = P.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = P.ROTATE;
      }
      break;
    case oe.PAN:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = P.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = P.PAN;
      }
      break;
    default:
      this.state = P.NONE;
  }
  this.state !== P.NONE && this.dispatchEvent(De);
}
function vs(e) {
  switch (this.state) {
    case P.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(e);
      break;
    case P.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(e);
      break;
    case P.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(e);
      break;
  }
}
function Ls(e) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== P.NONE || (e.preventDefault(), this.dispatchEvent(De), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(ut));
}
function Ps(e) {
  this.enabled !== !1 && this._handleKeyDown(e);
}
function Os(e) {
  switch (this._trackPointer(e), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case $.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(e), this.state = P.TOUCH_ROTATE;
          break;
        case $.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(e), this.state = P.TOUCH_PAN;
          break;
        default:
          this.state = P.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case $.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(e), this.state = P.TOUCH_DOLLY_PAN;
          break;
        case $.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(e), this.state = P.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = P.NONE;
      }
      break;
    default:
      this.state = P.NONE;
  }
  this.state !== P.NONE && this.dispatchEvent(De);
}
function Ns(e) {
  switch (this._trackPointer(e), this.state) {
    case P.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(e), this.update();
      break;
    case P.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(e), this.update();
      break;
    case P.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(e), this.update();
      break;
    case P.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(e), this.update();
      break;
    default:
      this.state = P.NONE;
  }
}
function Ds(e) {
  this.enabled !== !1 && e.preventDefault();
}
function ks(e) {
  e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function Is(e) {
  e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
var Ve = {
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
function Cs(e) {
  if (se(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(Ve, e.icon)) return;
  const t = e.icon;
  return Ve[t].includes(e.shape) ? t : void 0;
}
function Fs(e) {
  const [t, i, s, n] = e.viewBox, o = Math.max(s, n) / 14;
  return {
    scale: o,
    point: (a, r, h = 0) => new v((a - t - s / 2) / o, h, (r - i - n / 2) / o)
  };
}
function Us(e, t) {
  const i = lt(e), s = [i.x + i.width / 2, i.y + i.height / 2], n = ms(e), o = n.points.map(([a, r]) => new N((a - s[0]) / t, (r - s[1]) / t));
  return n.closed && o.length > 1 && o[0].equals(o[o.length - 1]) && o.pop(), {
    center: s,
    width: i.width / t,
    depth: i.height / t,
    points: o,
    closed: n.closed,
    rotation: -(e.rotation || 0) * Math.PI / 180
  };
}
function js(e, t) {
  const i = new us(new Mt(e.map((s) => new N(s.x, -s.y))), {
    depth: t,
    bevelEnabled: !1,
    steps: 1,
    curveSegments: 1
  });
  return i.rotateX(-Math.PI / 2), i;
}
function Hs(e, t, i) {
  const s = e.map((n) => new v(n.x, i, n.y));
  return t && s.length && s.push(s[0].clone()), new Ne().setFromPoints(s);
}
function Gs(e, t, i) {
  const s = [];
  for (let o = 0; o < e.length - (t ? 0 : 1); o += 1) {
    const a = e[o], r = e[(o + 1) % e.length], h = r.clone().sub(a);
    if (!h.lengthSq()) continue;
    const c = new N(-h.y, h.x).normalize().multiplyScalar(i / 2), l = [
      a.clone().add(c),
      a.clone().sub(c),
      r.clone().add(c),
      r.clone().sub(c)
    ];
    for (const u of [
      0,
      2,
      1,
      1,
      2,
      3
    ]) s.push(l[u].x, 0, l[u].y);
  }
  const n = new Ne();
  return n.setAttribute("position", new zt(s, 3)), n.computeVertexNormals(), n;
}
function dt(e, t) {
  return e.slice(0, t ? e.length : -1).flatMap((i, s) => {
    const n = e[(s + 1) % e.length], o = i.distanceTo(n);
    return o ? [{
      x: (i.x + n.x) / 2,
      z: (i.y + n.y) / 2,
      length: o,
      rotation: -Math.atan2(n.y - i.y, n.x - i.x)
    }] : [];
  });
}
function Bs(e, t) {
  const s = new Uint8Array(65536);
  let n = 781;
  for (let a = 0; a < 128; a += 1) for (let r = 0; r < 128; r += 1) {
    n = Math.imul(n, 1664525) + 1013904223 >>> 0;
    const h = n / 4294967296;
    let c = 0.94 + h * 0.06;
    if (e === "wood") {
      if (c = 0.89 + Math.sin(a * 0.82 + Math.sin(r * Math.PI / 64) * 2 + Math.sin(a * 0.19)) * 0.045 + h * 0.04, t) {
        const u = Math.floor(a / 32);
        c += [
          0,
          0.025,
          -0.02,
          0.012
        ][u], (a % 32 === 0 || (r + u * 47) % 128 === 0) && (c = 0.69);
      }
    } else e === "tile" ? c = r % 64 < 2 || a % 64 < 2 ? 0.73 : 0.96 + h * 0.04 : [
      "fabric",
      "carpet",
      "bed-sheet",
      "tatami"
    ].includes(e) ? c = 0.88 + (r % 4 < 2 == a % 4 < 2 ? 0.07 : 0) + h * 0.05 : (e === "stone" || e === "marble") && (c = 0.92 + Math.sin(r * 0.15 + Math.sin(a * 0.12)) * 0.025 + h * 0.055);
    const l = Math.round(c * 255);
    s.set([
      l,
      l,
      l,
      255
    ], (a * 128 + r) * 4);
  }
  const o = new qt(s, 128, 128, Zt);
  return o.colorSpace = ne, o.wrapS = o.wrapT = rt, t && e === "wood" && o.repeat.set(0.55, 0.55), o.magFilter = ct, o.minFilter = et, o.generateMipmaps = !0, o.anisotropy = 4, o.needsUpdate = !0, o;
}
var zs = {
  ...fs,
  wood: "#9c6847",
  stone: "#c5cbd0",
  tile: "#cbd6df",
  carpet: "#a67568",
  fabric: "#608e92",
  "bed-sheet": "#e3e7e9",
  metal: "#98acbf",
  glass: "#b3deeb",
  marble: "#e5e6e7",
  water: "#6aabbf",
  grass: "#b7cba0",
  forest: "#6d957d"
};
function Ks(e, t) {
  const i = /* @__PURE__ */ new Map(), s = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map();
  function o(r, h = 0) {
    const c = r.material || (r.category === "water" ? "water" : "unknown"), l = `${c}:${r.category}:${r.certainty}:${h}`;
    let u = i.get(l);
    if (!u) {
      const d = {
        danger: "#d77c80",
        magic: "#b29cdb",
        light: "#f4d697",
        actor: "#4598cf",
        marker: "#72b9cb",
        secret: "#8d9ca9"
      }, p = r.category === "terrain", g = c === "wood" && p ? "#c8ab85" : zs[c], _ = new W(!r.material && r.category in d ? d[r.category] : g);
      _.lerp(new W(h > 0 ? "#ffffff" : "#201c1a"), Math.abs(h));
      const b = ve(r, "").opacity * (c === "glass" ? 0.42 : 1), m = [
        "wood",
        "tile",
        "tatami",
        "fabric",
        "carpet",
        "bed-sheet",
        "stone",
        "sand",
        "dirt",
        "marble"
      ].includes(c), y = `${c}:${p}`;
      m && !n.has(y) && n.set(y, e.own(Bs(c, p)));
      const f = n.get(y) || null;
      u = e.own(new Oe({
        color: _,
        roughness: c === "metal" ? 0.32 : c === "glass" || c === "water" ? 0.22 : c === "wood" ? 0.64 : 0.92,
        metalness: c === "metal" ? 0.32 : 0,
        transparent: b < 1,
        opacity: b,
        depthWrite: b >= 1,
        side: 2,
        map: f,
        bumpMap: f,
        bumpScale: c === "wood" ? 0.018 : 9e-3,
        emissive: [
          "rune",
          "warm-light",
          "cold-light"
        ].includes(c) ? _ : "#000000",
        emissiveIntensity: 0.18
      })), i.set(l, u);
    }
    return u;
  }
  function a(r) {
    const h = `${r.certainty}:${r.category}`;
    let c = s.get(h);
    if (!c) {
      const l = r.certainty && r.certainty !== "confirmed";
      c = e.own(new Lt({
        color: t ? "#b1bfca" : "#798b91",
        dashSize: r.certainty === "unknown" ? 0.035 : 0.12,
        gapSize: l ? 0.09 : 0,
        transparent: !0,
        opacity: ve(r, "").opacity
      })), s.set(h, c);
    }
    return c;
  }
  return {
    mesh: o,
    line: a
  };
}
function Xs(e, t, i, s) {
  const { cylinder: n, ring: o, cone: a } = s;
  switch (e) {
    case "column": {
      const r = t.shape === "circle" ? n : void 0;
      return i(0, 0.08, 0, 1, 0.16, 1, -0.12, r), i(0, 0.91, 0, 0.68, 1.5, 0.68, 0.02, r), i(0, 1.7, 0, 0.9, 0.12, 0.9, 0.12, r), 1.76;
    }
    case "partition":
      for (const r of [-0.4, 0.4])
        i(r, 0.055, 0, 0.15, 0.11, 1, -0.18), i(r, 0.79, 0, 0.07, 1.5, 0.15, -0.15);
      return i(0, 0.83, 0, 0.78, 1.27, 0.09, 0.08), i(0, 1.5, 0, 0.88, 0.06, 0.15, 0.14), 1.54;
    case "ladder":
      for (const r of [-0.36, 0.36]) i(r, 0.9, 0, 0.09, 1.8, 0.2, -0.1);
      for (let r = 0; r < 6; r++) i(0, 0.18 + r * 0.29, 0, 0.7, 0.055, 0.16, 0.13);
      return 1.8;
    case "well":
      return i(0, 0.21, 0, 0.94, 0.42, 0.94, -0.08, o, t.material || "stone"), i(0, 0.44, 0, 1, 0.08, 1, 0.12, o, t.material || "stone"), 0.48;
    case "fountain":
      return i(0, 0.03, 0, 0.92, 0.06, 0.92, -0.2, n, t.material || "stone"), i(0, 0.13, 0, 1, 0.2, 1, 0.1, o, t.material || "stone"), i(0, 0.38, 0, 0.18, 0.7, 0.18, -0.06, n, t.material || "stone"), i(0, 0.72, 0, 0.48, 0.1, 0.48, 0.12, o, t.material || "stone"), i(0, 0.85, 0, 0.08, 0.17, 0.08, -0.12, n, t.material || "stone"), 0.935;
    case "fire":
      return i(0, 0.055, 0, 0.85, 0.11, 0.17, -0.28, void 0, "wood"), i(0, 0.11, 0, 0.17, 0.11, 0.85, -0.15, void 0, "wood"), i(0, 0.43, 0, 0.6, 0.62, 0.6, 0, a, "warm-light"), i(0.1, 0.31, 0.12, 0.32, 0.4, 0.32, 0.35, a, "warm-light"), 0.74;
    case "flag":
      return i(-0.37, 0.035, 0, 0.25, 0.07, 0.7, -0.22), i(-0.37, 0.8, 0, 0.045, 1.6, 0.08, -0.15), i(0.04, 1.28, 0, 0.77, 0.46, 0.035, 0.1, void 0, t.material || "fabric"), 1.6;
    case "sign":
      for (const r of [-0.3, 0.3])
        i(r, 0.055, 0, 0.18, 0.11, 0.85, -0.22), i(r, 0.62, 0, 0.07, 1.2, 0.16, -0.12);
      return i(0, 0.9, 0, 1, 0.64, 0.18, -0.05), i(0, 0.9, 0.095, 0.9, 0.52, 0.025, 0.22), 1.22;
    case "terminal":
      return i(0, 0.065, 0, 0.72, 0.13, 0.84, -0.25), i(0, 0.54, -0.09, 0.4, 1, 0.44, -0.1), i(0, 1.1, -0.12, 1, 0.7, 0.3, -0.16), i(0, 1.11, 0.04, 0.86, 0.54, 0.025, -0.6), i(0, 0.77, 0.21, 0.88, 0.06, 0.55, 0.12), 1.45;
    case "machine":
      i(0, 0.055, 0, 1, 0.11, 1, -0.25), i(-0.16, 0.39, 0, 0.62, 0.64, 0.82, 0), i(-0.16, 0.79, 0, 0.54, 0.22, 0.72, 0.15), i(0.34, 0.46, 0, 0.26, 0.76, 0.73, -0.14);
      for (const r of [
        -0.34,
        -0.2,
        -0.06,
        0.08
      ]) i(r, 0.5, 0.421, 0.04, 0.3, 0.014, -0.5);
      return 0.9;
    case "vending-machine":
      return i(0, 0.1, 0, 0.94, 0.2, 0.86, -0.25), i(0, 0.92, 0, 1, 1.68, 0.92, -0.02), i(-0.12, 1.11, 0.468, 0.64, 1.05, 0.018, -0.5), i(0.34, 1.05, 0.48, 0.17, 0.38, 0.03, -0.18), i(0, 0.31, 0.468, 0.74, 0.18, 0.018, -0.65), i(0, 1.73, 0, 1, 0.07, 0.98, 0.16), 1.765;
  }
}
function Vs(e, t) {
  const i = e.own(new Be(1, 1, 1, 3, 0.035)), s = e.own(new Be(1, 1, 1, 4, 0.16)), n = e.own(i.clone()), o = n.getAttribute("position");
  for (let u = 0; u < o.count; u += 1) {
    const d = 0.72 + 0.28 * (o.getY(u) + 0.5);
    o.setX(u, o.getX(u) * d), o.setZ(u, o.getZ(u) * d);
  }
  n.computeVertexNormals();
  const a = e.own(new es(0.5, 0.5, 1, 32)), r = e.own(new tt(0.5, 16, 10)), h = e.own(new Gt(0.5, 0)), c = e.own(new Yt(0.5, 1, 9)), l = e.own(new Ot([
    [0.35, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [0.35, 0.5],
    [0.35, -0.5]
  ].map(([u, d]) => new N(u, d)), 32));
  return function(d, p, g, _, b) {
    const m = Math.min(1.6, Math.min(_, b)), y = /* @__PURE__ */ new Map();
    function f(T, x, F, U, w, O, I = 0, H = i, X) {
      const Z = t.mesh(X ? {
        ...p,
        material: X
      } : p, I), ie = `${H.uuid}:${Z.uuid}`;
      y.has(ie) || y.set(ie, {
        geometry: H,
        material: Z,
        matrices: []
      }), y.get(ie).matrices.push(new K().makeScale(U * _, w * m, O * b).setPosition(T * _, x * m, F * b));
    }
    function R(T) {
      for (const x of [-0.37, 0.37]) for (const F of [-0.36, 0.36]) f(x, T / 2, F, 0.075, T, 0.075, -0.16, n);
    }
    function L() {
      switch (g) {
        case "table":
          if (p.shape === "circle")
            f(0, 0.6, 0, 1, 0.08, 1, 0.12, a), f(0, 0.29, 0, 0.18, 0.58, 0.18, -0.15, a), f(0, 0.04, 0, 0.43, 0.08, 0.43, -0.22, a);
          else {
            R(0.58);
            for (const T of [-0.36, 0.36]) f(0, 0.52, T, 0.83, 0.13, 0.045, -0.12);
            for (const T of [-0.37, 0.37]) f(T, 0.52, 0, 0.045, 0.13, 0.75, -0.12);
            f(0, 0.607, 0, 0.98, 0.065, 0.98, -0.1), f(0, 0.651, 0, 1, 0.035, 1, 0.12);
          }
          return 0.67 * m;
        case "chair":
          R(0.52), f(0, 0.55, 0.035, 1, 0.08, 0.93, 0.06), f(0, 0.595, 0.05, 0.91, 0.035, 0.83, 0.16);
          for (const T of [-0.42, 0.42]) f(T, 0.82, -0.425, 0.095, 0.73, 0.12, -0.1);
          for (const T of [
            -0.22,
            0,
            0.22
          ]) f(T, 0.9, -0.425, 0.12, 0.42, 0.07, 0.02);
          f(0, 1.14, -0.425, 0.96, 0.1, 0.14, 0.12);
          for (const T of [-0.37, 0.37]) f(T, 0.23, 0, 0.035, 0.045, 0.74, -0.12);
          return 1.19 * m;
        case "bed":
          return R(0.2), f(0, 0.24, 0, 1, 0.18, 1, -0.2), f(0, 0.39, 0.02, 0.96, 0.16, 0.92, 0.55), f(0, 0.5, 0.15, 0.98, 0.06, 0.63, 0.08), f(0, 0.5, -0.29, 0.64, 0.13, 0.22, 0.65), f(0, 0.47, -0.47, 1, 0.7, 0.06, -0.16), 0.82 * m;
        case "counter":
          f(0, 0.08, 0, 0.9, 0.16, 0.86, -0.28), f(0, 0.57, 0, 0.94, 0.9, 0.91, -0.08), f(0, 0.17, 0.46, 0.96, 0.1, 0.06, 0.06), f(0, 0.94, 0.46, 0.96, 0.08, 0.06, 0.08);
          for (const T of [
            -0.32,
            0,
            0.32
          ])
            f(T, 0.55, 0.46, 0.28, 0.66, 0.045, 0.03), f(T, 0.55, 0.487, 0.235, 0.52, 0.02, -0.09);
          return f(0, 1.025, 0, 1, 0.065, 1, -0.18), f(0, 1.065, 0, 1, 0.03, 1, 0.16), 1.08 * m;
        case "shelf":
          f(0, 1.05, -0.47, 1, 2.1, 0.06, -0.2);
          for (const T of [-0.48, 0.48]) f(T, 1.05, 0, 0.04, 2.1, 1, -0.08);
          for (let T = 0; T < 4; T += 1) f(0, 0.04 + T * 0.67, 0, 1, 0.06, 1, 0.12);
          for (const T of [-0.17, 0.17]) f(T, 1.03, 0, 0.025, 1.98, 0.92, -0.04);
          return f(0, 2.06, 0, 1, 0.08, 1, 0.16), 2.1 * m;
        case "sofa":
          R(0.14), f(0, 0.26, 0, 0.96, 0.27, 0.96, -0.18), f(0, 0.65, -0.37, 0.98, 0.76, 0.26, -0.08, s);
          for (const T of [-0.44, 0.44]) f(T, 0.52, 0, 0.12, 0.49, 0.98, 0.02, s);
          for (const T of [
            -0.26,
            0,
            0.26
          ])
            f(T, 0.46, 0.11, 0.245, 0.19, 0.72, 0.12, s), f(T, 0.77, -0.22, 0.245, 0.43, 0.22, 0.08, s);
          return 1.04 * m;
        case "bridge":
          for (let T = 0; T < 12; T += 1) f(0, 0.16, -0.46 + T * 0.083, 1, 0.1, 0.075, T % 2 ? 0.1 : 0);
          for (const T of [-0.45, 0.45]) {
            f(T, 0.61, 0, 0.045, 0.045, 1, -0.15);
            for (const x of [
              -0.45,
              0,
              0.45
            ]) f(T, 0.35, x, 0.055, 0.55, 0.04, -0.18);
          }
          return 0.65 * m;
        case "tree":
          return f(0, 0.44, 0, 0.14, 0.88, 0.14, -0.42, a), f(0, 1.04, 0, 1, 1.2, 1, -0.04, r), f(-0.16, 1.3, -0.06, 0.6, 0.65, 0.6, 0.13, r), 1.65 * m;
        case "rock":
          return f(0, 0.29, 0, 1, 0.62, 1, 0.03, h), 0.6 * m;
        default:
          return Xs(g, p, f, {
            cylinder: a,
            ring: l,
            cone: c
          }) * m;
      }
    }
    const A = L();
    for (const { geometry: T, material: x, matrices: F } of y.values()) {
      const U = e.own(new re(T, x, F.length));
      F.forEach((w, O) => U.setMatrixAt(O, w)), U.castShadow = x.opacity >= 0.8, U.receiveShadow = !0, d.add(U);
    }
    return A;
  };
}
var Ys = /* @__PURE__ */ JSON.parse('[{"icon":"table","file":"table.glb","originalFile":"furniture/Models/GLTF format/table.glb","sourceSha256":"ff1a94498d023957f4bc3ff6f55a7a82977d336dbf01a573b3364f03afe5ff61","sha256":"07cd3bfb1f6884b7476a2e6222f735bbd0e7ff9b29c59f210d9a06fe9f1ba5e8","bytes":12476,"triangles":120,"batches":1,"geometryBytes":11520,"size":[0.8414879441261292,0.3267339766025543,0.44737333059310913],"radius":0.4765094062648687},{"icon":"chair","file":"chairRounded.glb","originalFile":"furniture/Models/GLTF format/chairRounded.glb","sourceSha256":"53f4933ec547179c499f04dbda1231cf44b83ec82c7f4ab981cdf680aee5c973","sha256":"f62c6c7e655f8360971bd859c14c150a1f77355f14b5379b29cdd6d1fb97db4c","bytes":27844,"triangles":280,"batches":1,"geometryBytes":26880,"size":[0.20000000298023224,0.45499998331069946,0.20000000298023224],"radius":0.14142135834465194},{"icon":"bed","file":"bedSingle.glb","originalFile":"furniture/Models/GLTF format/bedSingle.glb","sourceSha256":"ca00c63f9a12da3138d902b2f5f18e0360fb6e8a5ac42ccb4bc3f185724b65d1","sha256":"b89c28f9ad8e77ddbc8fd9bcfb8a8f87157a7c8971dd20ee0718b6f585629c89","bytes":22864,"triangles":214,"batches":3,"geometryBytes":20544,"size":[0.5709999799728394,0.375,1.125],"radius":0.6294541280557842},{"icon":"shelf","file":"bookcaseOpenLow.glb","originalFile":"furniture/Models/GLTF format/bookcaseOpenLow.glb","sourceSha256":"6d4d625faf977a2dbf155f1313cd32c6310e463114a1cd4c08cb9f80a5fb1d75","sha256":"c67a8d18cd802afb82d74a73d0c0dc85a7188facbfb5ede13909b9bc6cc33226","bytes":18596,"triangles":184,"batches":1,"geometryBytes":17664,"size":[0.4000000059604645,0.4000000059604645,0.25],"radius":0.23584953082864699},{"icon":"tree","file":"tree_oak.glb","originalFile":"nature/Models/GLTF format/tree_oak.glb","sourceSha256":"d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3","sha256":"adb24a59f159f214971fefe7e51539d7a938a8a3908b0d756c25e914d0bce681","bytes":20500,"triangles":196,"batches":2,"geometryBytes":18816,"size":[0.6405540108680725,1.2262399204075336,0.7396479845046997],"radius":0.36982402101696993},{"icon":"rock","file":"stone_largeE.glb","originalFile":"nature/Models/GLTF format/stone_largeE.glb","sourceSha256":"392cf28f85aa4b7b7c5e12b1a3b87fe2b3a7c5ec1797d5d1d0d58edca6da9de8","sha256":"07185b2e5f8ce40fc14e8c29db249fa607da56651abcf22f93f8c02f4d7512af","bytes":7116,"triangles":64,"batches":1,"geometryBytes":6144,"size":[1.095458745956421,0.2922479815781114,0.9198710918426514],"radius":0.5865749968024526},{"icon":"stool","file":"stoolBar.glb","originalFile":"furniture/Models/GLTF format/stoolBar.glb","sourceSha256":"a86167a9f92401a61fec7e509ad089ecc552d0f299743add3aeb919acb24e341","sha256":"6fe6e654458f50ab7e73cc5977f055a50562cb74a56a8bd5ebaac312f03c4563","bytes":17852,"triangles":176,"batches":1,"geometryBytes":16896,"size":[0.2654399871826172,0.4350000023841858,0.2298777848482132],"radius":0.13272000284524055},{"icon":"bench","file":"bench.glb","originalFile":"furniture/Models/GLTF format/bench.glb","sourceSha256":"ba05a6d23a5a5a44da016757632070e47ff7587ce10e2f6d6d52328b4cf5489b","sha256":"21bd02dce1f980aff3bc22c916bdcbefa3db2fa11bd5dbbc9fbb07830f9bd87b","bytes":17280,"triangles":170,"batches":1,"geometryBytes":16320,"size":[0.4000000059604645,0.4699999988079071,0.20000000298023224],"radius":0.22360680108197992},{"icon":"sofa","file":"loungeSofa.glb","originalFile":"furniture/Models/GLTF format/loungeSofa.glb","sourceSha256":"1886b811c0d3ad0d8525a4fd43adf4112c497c8e0ed906f06877ca3517f4c7dd","sha256":"a4a0b16aa48731b61fcc08302c8bca8d2ff9e1ae41e77893ed9f2091f8a35ee2","bytes":13952,"triangles":128,"batches":2,"geometryBytes":12288,"size":[0.9799999594688416,0.46000000834465027,0.4100000262260437],"radius":0.5311543895291386},{"icon":"cabinet","file":"kitchenCabinet.glb","originalFile":"furniture/Models/GLTF format/kitchenCabinet.glb","sourceSha256":"7238c57778935ae25db5e57e9f7af3ba7068c71b005ff7cfbff3b6f3b1a13200","sha256":"0f9b3693f3de853fa68148bb71c9e29ecf38e784bfa7e39a7fb3cc78f76ce972","bytes":12604,"triangles":114,"batches":2,"geometryBytes":10944,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"stove","file":"kitchenStove.glb","originalFile":"furniture/Models/GLTF format/kitchenStove.glb","sourceSha256":"3239edb36295dfca9530a9b9a6ad0aff98ce62e7cf8d13ca2a5a1a6b2a904656","sha256":"6d1deee24fa30890cbfc540fa6e711fce2ab68cc82d0b68e104074c2c161b170","bytes":81356,"triangles":830,"batches":2,"geometryBytes":79680,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"refrigerator","file":"kitchenFridge.glb","originalFile":"furniture/Models/GLTF format/kitchenFridge.glb","sourceSha256":"8af4f4bbb1b5525ad8226e97926a5af60fa8fb20a3cb74dbda5328a9d320dbab","sha256":"69be9a8c3d3a804c494b92220710c61a2f87a4c3600922d0da3d5020eb3aef4c","bytes":25668,"triangles":250,"batches":2,"geometryBytes":24000,"size":[0.4300000071525574,0.9200000166893005,0.29193389415740967],"radius":0.2598679494998898},{"icon":"sink","file":"kitchenSink.glb","originalFile":"furniture/Models/GLTF format/kitchenSink.glb","sourceSha256":"7b9610277d71f00dcf1bba49cf4d98d77ce5177e84bf76c7da2f8893e542f743","sha256":"7063bb1597aae39279a3430952338d6f72fe8bccba5b93b143b930ba992f3878","bytes":32196,"triangles":318,"batches":2,"geometryBytes":30528,"size":[0.4300000071525574,0.4899999797344208,0.44999998807907104],"radius":0.3112073245532484},{"icon":"toilet","file":"toilet.glb","originalFile":"furniture/Models/GLTF format/toilet.glb","sourceSha256":"16165cfd03c56c2cb443b800570810a22ef770f65e7a468f6761d9dc14eaaeae","sha256":"42fcec7b0b225b544dcf05bde35f17e598cdf01c8f5f15f36aa55c76ab91652f","bytes":23732,"triangles":230,"batches":2,"geometryBytes":22080,"size":[0.31255000829696655,0.450965017080307,0.4771767109632492],"radius":0.2827908769988002},{"icon":"bathtub","file":"bathtub.glb","originalFile":"furniture/Models/GLTF format/bathtub.glb","sourceSha256":"54c405c7035aab63dc41e709dc3c50fc5bcfbc4cddc91ffc54188075a6d25d01","sha256":"f15e3a3316060b4ddca2dd1350109adc26bc11f1a4784e8dcb23465ccdb3cb5a","bytes":59480,"triangles":602,"batches":2,"geometryBytes":57792,"size":[0.5600000023841858,0.41999998688697815,1.190000057220459],"radius":0.6478308291120068},{"icon":"potted-plant","file":"pottedPlant.glb","originalFile":"furniture/Models/GLTF format/pottedPlant.glb","sourceSha256":"5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15","sha256":"d6be69190662ff9b0388b7332f9a8d8e0530d1373b5a3c08deea336ea09613e7","bytes":7420,"triangles":60,"batches":2,"geometryBytes":5760,"size":[0.21205927431583405,0.6540167927742004,0.24146194756031036],"radius":0.12073097378015518},{"icon":"light","file":"lampRoundFloor.glb","originalFile":"furniture/Models/GLTF format/lampRoundFloor.glb","sourceSha256":"50fe1b5b588edf15bfa9cc880f71a02a4fda6036350b24733d0ef4de5cc5e908","sha256":"f663a0f42fc9277cfc365f4ccc335fe8a80d621159dae74922dd8c3947fd2b36","bytes":8956,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.15203941613435745,0.8600000143051147,0.17555999755859375],"radius":0.08778000315811903},{"icon":"statue","file":"statue_ring.glb","originalFile":"nature/Models/GLTF format/statue_ring.glb","sourceSha256":"5c62e4165f7a76436faa0b20e98b47d0a9e5021dcbf2a0eef0cdf0912180f02c","sha256":"013b58818fbebae606f6cb9b5bc7f769ac6f55dbf5bc1c486787078a8761d29c","bytes":8976,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.6000000238418579,0.7964101441204547,0.4000000059604645],"radius":0.3605551391183468},{"icon":"chest","file":"chest.glb","originalFile":"survival/Models/GLB format/chest.glb","sourceSha256":"84b03023e425cc1f96c6d0b0f352608be9e8e01b112790e6b00b8651bf84379b","sha256":"dfaf5cf144a7465e313e87d08eb82b0039202500256a6e89f774d0a1e9c35946","bytes":32580,"triangles":322,"batches":2,"geometryBytes":30912,"size":[0.2603999972343445,0.2571914792060852,0.2720249891281128],"radius":0.18828552338788324},{"icon":"barrel","file":"barrel.glb","originalFile":"survival/Models/GLB format/barrel.glb","sourceSha256":"3a0d12f6bdd1badd361f64ce0fbbf878a4ccfc2de8ff1ac4ed4c1aea2a9ee04a","sha256":"3b1f6cdf0e406cdf9630649a1eca8bdf8428a9f07d794bafd70406e63dafa6e3","bytes":41228,"triangles":412,"batches":2,"geometryBytes":39552,"size":[0.23649999499320984,0.3440000116825104,0.23649999499320984],"radius":0.13364122923364707},{"icon":"tent","file":"tent-canvas.glb","originalFile":"survival/Models/GLB format/tent-canvas.glb","sourceSha256":"efc4bca46a22e4cc4fe391aeafba161c24bc39bfa75e192c57eaacaf686f9717","sha256":"8baaab74d57cfa38d73963dccd6fe711006d28ebef0145a410494625f4cc0b9d","bytes":15868,"triangles":148,"batches":2,"geometryBytes":14208,"size":[0.5607622265815735,0.4913683533668518,0.5610000491142273],"radius":0.37933337775768333},{"icon":"car","file":"sedan.glb","originalFile":"car/Models/GLB format/sedan.glb","sourceSha256":"b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7","sha256":"99b2d9141e842d542c406b83a3f8701519cad9f5a4f4d046b7b0d6f8cf12c0f8","bytes":197452,"triangles":2032,"batches":3,"geometryBytes":195072,"size":[1.5,1.2999999523162844,2.549999952316284],"radius":1.3472214803586575}]'), Ws = new Map(Ys.map((e) => [e.icon, {
  size: new v().fromArray(e.size),
  radius: e.radius
}])), Ye = {
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
}, Zs = /* @__PURE__ */ new Set([
  "tree",
  "rock",
  "stool",
  "barrel",
  "potted-plant",
  "light"
]), qs = {
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
function ft(e) {
  if (se(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(Ye, e.icon)) return;
  const t = e.icon;
  if (e.shape === "circle") return Zs.has(t) ? t : void 0;
  if (e.shape !== "rect") return;
  const { width: i, height: s } = lt(e), n = i / s, [o, a] = Ye[t];
  return n >= o && n <= a ? t : void 0;
}
function pt(e, t, { size: i, radius: s }, n, o) {
  const a = t === "shelf" ? Math.max(1, Math.ceil(n / o / (i.x / i.z))) : 1, r = Math.min((t === "tree" ? 3 : 2.5) / i.y, e.shape === "circle" ? n / (2 * s) : Math.min(n / a / i.x, o / i.z));
  return {
    count: a,
    scale: r,
    height: i.y * r
  };
}
function $s(e, t, i, s) {
  return pt(e, t, Ws.get(t), i, s).height;
}
function Qs(e, t, i, s, n, o, a, r) {
  const { size: h } = s, { count: c, scale: l, height: u } = pt(t, i, s, n, o), d = t.material ? t : {
    ...t,
    material: qs[i] || "unknown"
  };
  for (const p of s.parts) {
    const g = a.own(p.geometry.clone());
    if (g.scale(l, l, l), i === "table") {
      const f = g.getAttribute("position"), R = h.x * l / 2, L = n / 2 - R;
      for (let A = 0; A < f.count; A++) {
        if (f.getY(A) < h.y * l * 0.55) continue;
        const T = f.getX(A);
        f.setX(A, T + Math.max(-1, Math.min(1, T / (R * 0.5))) * L);
      }
      g.computeVertexNormals();
    }
    g.computeBoundingBox(), g.computeBoundingSphere();
    let _ = d;
    p.role === "soft" || p.role === "shade" ? _ = {
      ...t,
      material: "bed-sheet"
    } : p.role === "foliage" ? _ = {
      ...t,
      material: "forest"
    } : p.role === "window" ? _ = {
      ...t,
      material: "glass"
    } : p.role === "wood" ? _ = {
      ...t,
      material: "wood"
    } : p.role === "bark" && (!t.material || ["grass", "forest"].includes(t.material)) && (_ = {
      ...t,
      material: "wood"
    });
    const b = p.role === "detail" ? i === "car" ? -0.78 : -0.25 : p.role === "bark" ? -0.22 : p.role === "window" ? -0.3 : p.role === "soft" ? 0.12 : 0, m = r.mesh(_, b), y = a.own(new re(g, m, c));
    for (let f = 0; f < c; f++) y.setMatrixAt(f, new K().makeTranslation((f - (c - 1) / 2) * h.x * l, 0, 0));
    y.castShadow = m.opacity >= 0.8, y.receiveShadow = !0, e.add(y);
  }
  return u;
}
function Js(e, t, i, s, n, o) {
  const a = dt(t, i), r = [], h = Math.max(0.45, a.reduce((u, d) => u + d.length, 0) / 128);
  let c = 0;
  for (const u of a) {
    for (const d of [0.22, 0.5]) r.push(new K().makeRotationY(u.rotation).scale(new v(u.length, 0.045, 0.04)).setPosition(u.x, d, u.z));
    for (; c <= u.length; ) {
      const d = c - u.length / 2;
      r.push(new K().makeScale(0.065, 0.58, 0.065).setPosition(u.x + Math.cos(u.rotation) * d, 0.29, u.z - Math.sin(u.rotation) * d)), c += h;
    }
    c -= u.length;
  }
  if (!i && t.length) {
    const u = t.at(-1);
    r.push(new K().makeScale(0.065, 0.58, 0.065).setPosition(u.x, 0.29, u.y));
  }
  const l = o.own(new re(s, n, r.length));
  return r.forEach((u, d) => l.setMatrixAt(d, u)), l.castShadow = n.opacity >= 0.8, l.receiveShadow = !0, e.add(l), 0.58;
}
function en(e, t) {
  let i = !1;
  for (let s = 0, n = t.length - 1; s < t.length; n = s++) {
    const o = t[s], a = t[n];
    o.y > e.y != a.y > e.y && e.x < (a.x - o.x) * (e.y - o.y) / (a.y - o.y) + o.x && (i = !i);
  }
  return i;
}
function tn(e, t, i, s = Fs(e)) {
  const n = new ht(), o = new de();
  try {
    const a = Ks(n, t), r = Vs(n, a), h = n.own(new ss(1, 1, 1)), c = n.own(new tt(0.5, 8, 6)), l = ys(e.elements), u = /* @__PURE__ */ new Map(), d = [], p = new te();
    for (const [_, b] of gs(e.elements).entries()) {
      const m = Us(b, s.scale), y = new de();
      let f = 0.015, R = !1;
      const L = Cs(b), A = ft(b), T = A && i?.get(A), x = b.icon === "fence" && ["path", "curve"].includes(b.shape) && !se(b) && !["wall", "grid"].includes(b.category), F = !L && !se(b) && ze(b) && (ps(b) || ["furniture", "decoration"].includes(b.category));
      if (b.shape === "icon" || b.shape === "label") f = 0.08;
      else if (b.category === "wall") {
        f = 1.1;
        const w = dt(m.points, m.closed), O = n.own(new re(h, a.mesh(b, 0.12), w.length));
        O.castShadow = O.receiveShadow = !0, y.add(O), w.forEach((I, H) => {
          const X = new K().makeRotationY(I.rotation).scale(new v(I.length, f, 0.08)).setPosition(I.x, f / 2, I.z);
          O.setMatrixAt(H, X);
        }), d.push(O);
      } else if (x) f = Js(y, m.points, m.closed, h, a.mesh(b), n);
      else if (A && T) f = Qs(y, b, A, T, m.width, m.depth, n, a);
      else if (L) f = r(y, b, L, m.width, m.depth);
      else if (ze(b)) {
        f = F ? 0.2 : 0.015;
        const w = new pe(n.own(js(m.points, f)), a.mesh(b));
        w.castShadow = f > 0.1, w.receiveShadow = !0, y.add(w);
      } else if (b.category === "road" || b.category === "water") {
        const w = new pe(n.own(Gs(m.points, m.closed, b.category === "road" ? 0.16 : 0.08).translate(0, f, 0)), a.mesh(b));
        w.receiveShadow = !0, y.add(w);
      }
      if (L || T) {
        const w = new te().setFromObject(y), O = Math.max(m.width, m.depth) * 1e-6;
        R = w.min.x > -m.width / 2 + O || w.max.x < m.width / 2 - O || w.min.z > -m.depth / 2 + O || w.max.z < m.depth / 2 - O;
      }
      if (m.points.length && (R || !L && !T)) {
        const w = new st(n.own(Hs(m.points, m.closed, R ? 0.019 : b.category === "wall" ? 0.012 : f + 4e-3)), a.line(b));
        w.computeLineDistances(), y.add(w);
      }
      const U = (l.get(b.id) || []).flatMap((w) => {
        const O = new N((w.x - m.center[0]) / s.scale, (w.y - m.center[1]) / s.scale), I = w.size / s.scale / 2;
        return Array.from({ length: 8 }, (H, X) => new N(O.x + I * Math.cos(X * Math.PI / 4), O.y + I * Math.sin(X * Math.PI / 4))).every((H) => en(H, m.points)) ? [{
          center: O,
          radius: I
        }] : [];
      });
      if (U.length) {
        const w = new re(c, a.mesh(b, -0.13), U.length);
        U.forEach(({ center: O, radius: I }, H) => w.setMatrixAt(H, new K().makeScale(I * 2, I * 1.4, I * 2).setPosition(O.x, I * 0.7 + f, O.y))), w.castShadow = w.receiveShadow = !0, n.own(w), y.add(w);
      }
      if (y.position.copy(s.point(...m.center, _ * 2e-3)), y.rotation.y = m.rotation, o.add(y), A) {
        const w = $s(b, A, m.width, m.depth) + 0.1;
        y.updateMatrix(), p.union(new te(new v(-m.width / 2, 0, -m.depth / 2), new v(m.width / 2, w, m.depth / 2)).applyMatrix4(y.matrix));
      }
      se(b) ? u.set(b.id, s.point(...m.center, y.position.y + 0.025)) : L || A || F ? u.set(b.id, s.point(...m.center, y.position.y + f + 0.1)) : u.set(b.id, s.point(...bs(b, 0), y.position.y + (x ? f : 0) + 0.1));
    }
    const g = new te().setFromObject(o).union(p);
    for (const _ of u.values()) g.expandByPoint(_);
    return {
      group: o,
      anchors: u,
      bounds: g,
      frame: s,
      updateWalls(_) {
        for (const b of d) b.scale.y = _ ? 0.2 / 1.1 : 1;
      },
      dispose() {
        o.removeFromParent(), n.dispose(), o.clear();
      }
    };
  } catch (a) {
    throw n.dispose(), o.clear(), a;
  }
}
var We = (e, t) => e.x < t.x + t.w + 3 && e.x + e.w + 3 > t.x && e.y < t.y + t.h + 3 && e.y + e.h + 3 > t.y;
function sn(e, t, i, s = []) {
  const n = /* @__PURE__ */ new Map(), o = [...e].sort((l, u) => l.priority - u.priority || l.id.localeCompare(u.id)), a = [...s], r = o.filter((l) => l.badge).map(({ anchor: l }) => ({
    x: l.x - 3,
    y: l.y - 3,
    w: 6,
    h: 6
  })), h = (l) => l.x >= 3 && l.y >= 3 && l.x + l.w <= t - 3 && l.y + l.h <= i - 3, c = (l) => h(l) && !a.some((u) => We(l, u)) && !r.some((u) => We(l, u));
  for (const l of o) {
    const u = { anchor: { ...l.anchor } };
    if (n.set(l.id, u), !l.badge) continue;
    const { w: d, h: p } = l.badge, { x: g, y: _ } = l.anchor, b = [];
    for (const y of [
      9,
      27,
      45
    ]) b.push({
      x: g - d / 2,
      y: _ - p - y,
      w: d,
      h: p
    }, {
      x: g + y,
      y: _ - p / 2,
      w: d,
      h: p
    }, {
      x: g - d - y,
      y: _ - p / 2,
      w: d,
      h: p
    }, {
      x: g - d / 2,
      y: _ + y,
      w: d,
      h: p
    });
    const m = b.map((y) => ({
      x: Math.max(3, Math.min(t - d - 3, y.x)),
      y: Math.max(3, Math.min(i - p - 3, y.y)),
      w: d,
      h: p
    }));
    u.badge = m.find(c) || m[0], a.push(u.badge);
  }
  for (const l of o) {
    if (!l.caption) continue;
    const u = n.get(l.id), { w: d, h: p } = l.caption, g = u.badge || {
      ...l.anchor,
      w: 0,
      h: 0
    };
    u.caption = [
      {
        x: g.x + (g.w - d) / 2,
        y: g.y - p - 5,
        w: d,
        h: p
      },
      {
        x: g.x + g.w + 6,
        y: g.y + (g.h - p) / 2,
        w: d,
        h: p
      },
      {
        x: g.x - d - 6,
        y: g.y + (g.h - p) / 2,
        w: d,
        h: p
      },
      {
        x: g.x + (g.w - d) / 2,
        y: g.y + g.h + 5,
        w: d,
        h: p
      }
    ].find(c), u.caption && a.push(u.caption);
  }
  return n;
}
function nn(e, t, i) {
  const s = t.elements.filter((n) => n.label || se(n)).map((n) => {
    const o = se(n) && n.shape !== "label", a = n.actorKey === "player", r = a ? 0 : n.category === "door" ? 1 : n.category === "actor" ? 2 : o ? 3 : 4, h = n.label || _s[n.category], c = document.createElement("span");
    c.className = `map-3d-label is-${n.category}${a ? " is-player" : ""}`, c.dataset.element = n.id, c.style.zIndex = String(10 - r), o && (c.setAttribute("role", "img"), c.setAttribute("aria-label", h));
    const l = ve(n, "");
    c.style.opacity = String(l.opacity);
    const u = document.createElement("span");
    u.className = "map-3d-glyph", u.setAttribute("aria-hidden", "true");
    const d = document.createElement("span");
    d.className = "map-3d-anchor", d.setAttribute("aria-hidden", "true");
    const p = document.createElement("span");
    p.className = "map-3d-leader", p.setAttribute("aria-hidden", "true"), o && c.append(p, d, u);
    const g = document.createElement("span");
    return g.textContent = h, g.className = "map-3d-label-text", o && g.setAttribute("aria-hidden", "true"), c.append(g), e.append(c), {
      element: n,
      node: c,
      glyph: u,
      dot: d,
      leader: p,
      caption: g,
      recipe: l,
      hasGlyph: o,
      priority: r,
      anchor: i.get(n.id)
    };
  });
  return {
    symbols(n) {
      for (const o of s)
        o.glyph.textContent = n ? o.recipe.icon : o.recipe.fallback, o.glyph.classList.toggle("has-symbols", n);
    },
    update(n, o, a, r) {
      const h = [];
      for (const { element: d, node: p, caption: g, glyph: _, anchor: b, hasGlyph: m, priority: y } of s) {
        p.style.visibility = "hidden", g.hidden = !r;
        const f = b.clone().project(n), R = (f.x + 1) * o / 2, L = (1 - f.y) * a / 2;
        f.z < -1 || f.z > 1 || R < 0 || R > o || L < 0 || L > a || h.push({
          id: d.id,
          anchor: {
            x: R,
            y: L
          },
          priority: y,
          badge: m ? {
            w: _.offsetWidth,
            h: _.offsetHeight
          } : void 0,
          caption: r ? {
            w: g.offsetWidth,
            h: g.offsetHeight
          } : void 0
        });
      }
      const c = e.parentElement?.querySelector(".map-viewport-controls")?.getBoundingClientRect(), l = e.getBoundingClientRect(), u = sn(h, o, a, c ? [{
        x: c.x - l.x,
        y: c.y - l.y,
        w: c.width,
        h: c.height
      }] : []);
      for (const { element: d, node: p, caption: g, dot: _, leader: b } of s) {
        const m = u.get(d.id), y = m?.badge || m?.caption;
        if (g.style.visibility = m?.caption ? "inherit" : "hidden", !(!m || !y) && (p.style.visibility = "visible", p.style.transform = `translate(${y.x}px, ${y.y}px)`, p.style.width = `${y.w}px`, p.style.height = `${y.h}px`, m.caption && (g.style.left = `${m.caption.x - y.x}px`, g.style.top = `${m.caption.y - y.y}px`), m.badge)) {
          const f = m.anchor.x - y.x, R = m.anchor.y - y.y;
          _.style.transform = `translate(${f}px, ${R}px)`;
          const L = Math.max(0, Math.min(y.w, f)), A = Math.max(0, Math.min(y.h, R));
          b.style.width = `${Math.hypot(L - f, A - R)}px`, b.style.transform = `translate(${f}px, ${R}px) rotate(${Math.atan2(A - R, L - f)}rad)`;
        }
      }
    },
    dispose() {
      for (const { node: n } of s) n.remove();
    }
  };
}
function Ze(e, t) {
  if (t === 0)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), e;
  if (t === 2 || t === 1) {
    let i = e.getIndex();
    if (i === null) {
      const a = [], r = e.getAttribute("position");
      if (r !== void 0) {
        for (let h = 0; h < r.count; h++) a.push(h);
        e.setIndex(a), i = e.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), e;
    }
    const s = i.count - 2, n = [];
    if (t === 2) for (let a = 1; a <= s; a++)
      n.push(i.getX(0)), n.push(i.getX(a)), n.push(i.getX(a + 1));
    else for (let a = 0; a < s; a++) a % 2 === 0 ? (n.push(i.getX(a)), n.push(i.getX(a + 1)), n.push(i.getX(a + 2))) : (n.push(i.getX(a + 2)), n.push(i.getX(a + 1)), n.push(i.getX(a)));
    n.length / 3 !== s && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const o = e.clone();
    return o.setIndex(n), o.clearGroups(), o;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", t), e;
}
var on = class extends jt {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new hn(t);
    }), this.register(function(t) {
      return new un(t);
    }), this.register(function(t) {
      return new Tn(t);
    }), this.register(function(t) {
      return new wn(t);
    }), this.register(function(t) {
      return new xn(t);
    }), this.register(function(t) {
      return new fn(t);
    }), this.register(function(t) {
      return new pn(t);
    }), this.register(function(t) {
      return new mn(t);
    }), this.register(function(t) {
      return new gn(t);
    }), this.register(function(t) {
      return new ln(t);
    }), this.register(function(t) {
      return new bn(t);
    }), this.register(function(t) {
      return new dn(t);
    }), this.register(function(t) {
      return new _n(t);
    }), this.register(function(t) {
      return new yn(t);
    }), this.register(function(t) {
      return new rn(t);
    }), this.register(function(t) {
      return new En(t);
    }), this.register(function(t) {
      return new Mn(t);
    });
  }
  load(e, t, i, s) {
    const n = this;
    let o;
    if (this.resourcePath !== "") o = this.resourcePath;
    else if (this.path !== "") {
      const h = ue.extractUrlBase(e);
      o = ue.resolveURL(h, this.path);
    } else o = ue.extractUrlBase(e);
    this.manager.itemStart(e);
    const a = function(h) {
      s ? s(h) : console.error(h), n.manager.itemError(e), n.manager.itemEnd(e);
    }, r = new at(this.manager);
    r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(h) {
      try {
        n.parse(h, o, function(c) {
          t(c), n.manager.itemEnd(e);
        }, a);
      } catch (c) {
        a(c);
      }
    }, i, a);
  }
  setDRACOLoader(e) {
    return this.dracoLoader = e, this;
  }
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this;
  }
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this;
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this;
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this;
  }
  parse(e, t, i, s) {
    let n;
    const o = {}, a = {}, r = new TextDecoder();
    if (typeof e == "string") n = JSON.parse(e);
    else if (e instanceof ArrayBuffer) if (r.decode(new Uint8Array(e, 0, 4)) === mt) {
      try {
        o[S.KHR_BINARY_GLTF] = new Sn(e);
      } catch (c) {
        s && s(c);
        return;
      }
      n = JSON.parse(o[S.KHR_BINARY_GLTF].content);
    } else n = JSON.parse(r.decode(e));
    else n = e;
    if (n.asset === void 0 || n.asset.version[0] < 2) {
      s && s(/* @__PURE__ */ new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const h = new Un(n, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    h.fileLoader.setRequestHeader(this.requestHeader);
    for (let c = 0; c < this.pluginCallbacks.length; c++) {
      const l = this.pluginCallbacks[c](h);
      l.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[l.name] = l, o[l.name] = !0;
    }
    if (n.extensionsUsed) for (let c = 0; c < n.extensionsUsed.length; ++c) {
      const l = n.extensionsUsed[c], u = n.extensionsRequired || [];
      switch (l) {
        case S.KHR_MATERIALS_UNLIT:
          o[l] = new cn();
          break;
        case S.KHR_DRACO_MESH_COMPRESSION:
          o[l] = new Rn(n, this.dracoLoader);
          break;
        case S.KHR_TEXTURE_TRANSFORM:
          o[l] = new An();
          break;
        case S.KHR_MESH_QUANTIZATION:
          o[l] = new vn();
          break;
        default:
          u.indexOf(l) >= 0 && a[l] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + l + '".');
      }
    }
    h.setExtensions(o), h.setPlugins(a), h.parse(i, s);
  }
  parseAsync(e, t) {
    const i = this;
    return new Promise(function(s, n) {
      i.parse(e, t, s, n);
    });
  }
};
function an() {
  let e = {};
  return {
    get: function(t) {
      return e[t];
    },
    add: function(t, i) {
      e[t] = i;
    },
    remove: function(t) {
      delete e[t];
    },
    removeAll: function() {
      e = {};
    }
  };
}
var S = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
}, rn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_LIGHTS_PUNCTUAL, this.cache = {
      refs: {},
      uses: {}
    };
  }
  _markDefs() {
    const e = this.parser, t = this.parser.json.nodes || [];
    for (let i = 0, s = t.length; i < s; i++) {
      const n = t[i];
      n.extensions && n.extensions[this.name] && n.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, n.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const t = this.parser, i = "light:" + e;
    let s = t.cache.get(i);
    if (s) return s;
    const n = t.json, o = ((n.extensions && n.extensions[this.name] || {}).lights || [])[e];
    let a;
    const r = new W(16777215);
    o.color !== void 0 && r.setRGB(o.color[0], o.color[1], o.color[2], Q);
    const h = o.range !== void 0 ? o.range : 0;
    switch (o.type) {
      case "directional":
        a = new Re(r), a.target.position.set(0, 0, -1), a.add(a.target);
        break;
      case "point":
        a = new hs(r), a.distance = h;
        break;
      case "spot":
        a = new Et(r), a.distance = h, o.spot = o.spot || {}, o.spot.innerConeAngle = o.spot.innerConeAngle !== void 0 ? o.spot.innerConeAngle : 0, o.spot.outerConeAngle = o.spot.outerConeAngle !== void 0 ? o.spot.outerConeAngle : Math.PI / 4, a.angle = o.spot.outerConeAngle, a.penumbra = 1 - o.spot.innerConeAngle / o.spot.outerConeAngle, a.target.position.set(0, 0, -1), a.add(a.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + o.type);
    }
    return a.position.set(0, 0, 0), V(a, o), o.intensity !== void 0 && (a.intensity = o.intensity), a.name = t.createUniqueName(o.name || "light_" + e), s = Promise.resolve(a), t.cache.add(i, s), s;
  }
  getDependency(e, t) {
    if (e === "light")
      return this._loadLight(t);
  }
  createNodeAttachment(e) {
    const t = this, i = this.parser, s = i.json.nodes[e], n = (s.extensions && s.extensions[this.name] || {}).light;
    return n === void 0 ? null : this._loadLight(n).then(function(o) {
      return i._getNodeRef(t.cache, n, o);
    });
  }
}, cn = class {
  constructor() {
    this.name = S.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return he;
  }
  extendParams(e, t, i) {
    const s = [];
    e.color = new W(1, 1, 1), e.opacity = 1;
    const n = t.pbrMetallicRoughness;
    if (n) {
      if (Array.isArray(n.baseColorFactor)) {
        const o = n.baseColorFactor;
        e.color.setRGB(o[0], o[1], o[2], Q), e.opacity = o[3];
      }
      n.baseColorTexture !== void 0 && s.push(i.assignTexture(e, "map", n.baseColorTexture, ne));
    }
    return Promise.all(s);
  }
}, ln = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
    const s = i.extensions[this.name].emissiveStrength;
    return s !== void 0 && (t.emissiveIntensity = s), Promise.resolve();
  }
}, hn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    if (o.clearcoatFactor !== void 0 && (t.clearcoat = o.clearcoatFactor), o.clearcoatTexture !== void 0 && n.push(i.assignTexture(t, "clearcoatMap", o.clearcoatTexture)), o.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = o.clearcoatRoughnessFactor), o.clearcoatRoughnessTexture !== void 0 && n.push(i.assignTexture(t, "clearcoatRoughnessMap", o.clearcoatRoughnessTexture)), o.clearcoatNormalTexture !== void 0 && (n.push(i.assignTexture(t, "clearcoatNormalMap", o.clearcoatNormalTexture)), o.clearcoatNormalTexture.scale !== void 0)) {
      const a = o.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new N(a, a);
    }
    return Promise.all(n);
  }
}, un = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
    const s = i.extensions[this.name];
    return t.dispersion = s.dispersion !== void 0 ? s.dispersion : 0, Promise.resolve();
  }
}, dn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    return o.iridescenceFactor !== void 0 && (t.iridescence = o.iridescenceFactor), o.iridescenceTexture !== void 0 && n.push(i.assignTexture(t, "iridescenceMap", o.iridescenceTexture)), o.iridescenceIor !== void 0 && (t.iridescenceIOR = o.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), o.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = o.iridescenceThicknessMinimum), o.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = o.iridescenceThicknessMaximum), o.iridescenceThicknessTexture !== void 0 && n.push(i.assignTexture(t, "iridescenceThicknessMap", o.iridescenceThicknessTexture)), Promise.all(n);
  }
}, fn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [];
    t.sheenColor = new W(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const o = s.extensions[this.name];
    if (o.sheenColorFactor !== void 0) {
      const a = o.sheenColorFactor;
      t.sheenColor.setRGB(a[0], a[1], a[2], Q);
    }
    return o.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = o.sheenRoughnessFactor), o.sheenColorTexture !== void 0 && n.push(i.assignTexture(t, "sheenColorMap", o.sheenColorTexture, ne)), o.sheenRoughnessTexture !== void 0 && n.push(i.assignTexture(t, "sheenRoughnessMap", o.sheenRoughnessTexture)), Promise.all(n);
  }
}, pn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    return o.transmissionFactor !== void 0 && (t.transmission = o.transmissionFactor), o.transmissionTexture !== void 0 && n.push(i.assignTexture(t, "transmissionMap", o.transmissionTexture)), Promise.all(n);
  }
}, mn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    t.thickness = o.thicknessFactor !== void 0 ? o.thicknessFactor : 0, o.thicknessTexture !== void 0 && n.push(i.assignTexture(t, "thicknessMap", o.thicknessTexture)), t.attenuationDistance = o.attenuationDistance || 1 / 0;
    const a = o.attenuationColor || [
      1,
      1,
      1
    ];
    return t.attenuationColor = new W().setRGB(a[0], a[1], a[2], Q), Promise.all(n);
  }
}, gn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name]) return Promise.resolve();
    const s = i.extensions[this.name];
    return t.ior = s.ior !== void 0 ? s.ior : 1.5, Promise.resolve();
  }
}, bn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    t.specularIntensity = o.specularFactor !== void 0 ? o.specularFactor : 1, o.specularTexture !== void 0 && n.push(i.assignTexture(t, "specularIntensityMap", o.specularTexture));
    const a = o.specularColorFactor || [
      1,
      1,
      1
    ];
    return t.specularColor = new W().setRGB(a[0], a[1], a[2], Q), o.specularColorTexture !== void 0 && n.push(i.assignTexture(t, "specularColorMap", o.specularColorTexture, ne)), Promise.all(n);
  }
}, yn = class {
  constructor(e) {
    this.parser = e, this.name = S.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    return t.bumpScale = o.bumpFactor !== void 0 ? o.bumpFactor : 1, o.bumpTexture !== void 0 && n.push(i.assignTexture(t, "bumpMap", o.bumpTexture)), Promise.all(n);
  }
}, _n = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : Y;
  }
  extendMaterialParams(e, t) {
    const i = this.parser, s = i.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const n = [], o = s.extensions[this.name];
    return o.anisotropyStrength !== void 0 && (t.anisotropy = o.anisotropyStrength), o.anisotropyRotation !== void 0 && (t.anisotropyRotation = o.anisotropyRotation), o.anisotropyTexture !== void 0 && n.push(i.assignTexture(t, "anisotropyMap", o.anisotropyTexture)), Promise.all(n);
  }
}, Tn = class {
  constructor(e) {
    this.parser = e, this.name = S.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const t = this.parser, i = t.json, s = i.textures[e];
    if (!s.extensions || !s.extensions[this.name]) return null;
    const n = s.extensions[this.name], o = t.options.ktx2Loader;
    if (!o) {
      if (i.extensionsRequired && i.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return t.loadTextureImage(e, n.source, o);
  }
}, wn = class {
  constructor(e) {
    this.parser = e, this.name = S.EXT_TEXTURE_WEBP;
  }
  loadTexture(e) {
    const t = this.name, i = this.parser, s = i.json, n = s.textures[e];
    if (!n.extensions || !n.extensions[t]) return null;
    const o = n.extensions[t], a = s.images[o.source];
    let r = i.textureLoader;
    if (a.uri) {
      const h = i.options.manager.getHandler(a.uri);
      h !== null && (r = h);
    }
    return i.loadTextureImage(e, o.source, r);
  }
}, xn = class {
  constructor(e) {
    this.parser = e, this.name = S.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const t = this.name, i = this.parser, s = i.json, n = s.textures[e];
    if (!n.extensions || !n.extensions[t]) return null;
    const o = n.extensions[t], a = s.images[o.source];
    let r = i.textureLoader;
    if (a.uri) {
      const h = i.options.manager.getHandler(a.uri);
      h !== null && (r = h);
    }
    return i.loadTextureImage(e, o.source, r);
  }
}, En = class {
  constructor(e) {
    this.name = S.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const t = this.parser.json, i = t.bufferViews[e];
    if (i.extensions && i.extensions[this.name]) {
      const s = i.extensions[this.name], n = this.parser.getDependency("buffer", s.buffer), o = this.parser.options.meshoptDecoder;
      if (!o || !o.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return n.then(function(a) {
        const r = s.byteOffset || 0, h = s.byteLength || 0, c = s.count, l = s.byteStride, u = new Uint8Array(a, r, h);
        return o.decodeGltfBufferAsync ? o.decodeGltfBufferAsync(c, l, u, s.mode, s.filter).then(function(d) {
          return d.buffer;
        }) : o.ready.then(function() {
          const d = new ArrayBuffer(c * l);
          return o.decodeGltfBuffer(new Uint8Array(d), c, l, u, s.mode, s.filter), d;
        });
      });
    } else return null;
  }
}, Mn = class {
  constructor(e) {
    this.name = S.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, i = t.nodes[e];
    if (!i.extensions || !i.extensions[this.name] || i.mesh === void 0) return null;
    const s = t.meshes[i.mesh];
    for (const r of s.primitives) if (r.mode !== B.TRIANGLES && r.mode !== B.TRIANGLE_STRIP && r.mode !== B.TRIANGLE_FAN && r.mode !== void 0) return null;
    const n = i.extensions[this.name].attributes, o = [], a = {};
    for (const r in n) o.push(this.parser.getDependency("accessor", n[r]).then((h) => (a[r] = h, a[r])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((r) => {
      const h = r.pop(), c = h.isGroup ? h.children : [h], l = r[0].count, u = [];
      for (const d of c) {
        const p = new K(), g = new v(), _ = new me(), b = new v(1, 1, 1), m = new re(d.geometry, d.material, l);
        for (let y = 0; y < l; y++)
          a.TRANSLATION && g.fromBufferAttribute(a.TRANSLATION, y), a.ROTATION && _.fromBufferAttribute(a.ROTATION, y), a.SCALE && b.fromBufferAttribute(a.SCALE, y), m.setMatrixAt(y, p.compose(g, _, b));
        for (const y in a) if (y === "_COLOR_0") {
          const f = a[y];
          m.instanceColor = new Ft(f.array, f.itemSize, f.normalized);
        } else y !== "TRANSLATION" && y !== "ROTATION" && y !== "SCALE" && d.geometry.setAttribute(y, a[y]);
        nt.prototype.copy.call(m, d), this.parser.assignFinalMaterial(m), u.push(m);
      }
      return h.isGroup ? (h.clear(), h.add(...u), h) : u[0];
    }));
  }
}, mt = "glTF", le = 12, qe = {
  JSON: 1313821514,
  BIN: 5130562
}, Sn = class {
  constructor(e) {
    this.name = S.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, le), i = new TextDecoder();
    if (this.header = {
      magic: i.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== mt) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - le, n = new DataView(e, le);
    let o = 0;
    for (; o < s; ) {
      const a = n.getUint32(o, !0);
      o += 4;
      const r = n.getUint32(o, !0);
      if (o += 4, r === qe.JSON) {
        const h = new Uint8Array(e, le + o, a);
        this.content = i.decode(h);
      } else if (r === qe.BIN) {
        const h = le + o;
        this.body = e.slice(h, h + a);
      }
      o += a;
    }
    if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}, Rn = class {
  constructor(e, t) {
    if (!t) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = S.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const i = this.json, s = this.dracoLoader, n = e.extensions[this.name].bufferView, o = e.extensions[this.name].attributes, a = {}, r = {}, h = {};
    for (const c in o) {
      const l = Le[c] || c.toLowerCase();
      a[l] = o[c];
    }
    for (const c in e.attributes) {
      const l = Le[c] || c.toLowerCase();
      if (o[c] !== void 0) {
        const u = i.accessors[e.attributes[c]];
        h[l] = ae[u.componentType].name, r[l] = u.normalized === !0;
      }
    }
    return t.getDependency("bufferView", n).then(function(c) {
      return new Promise(function(l, u) {
        s.decodeDracoFile(c, function(d) {
          for (const p in d.attributes) {
            const g = d.attributes[p], _ = r[p];
            _ !== void 0 && (g.normalized = _);
          }
          l(d);
        }, a, h, Q, u);
      });
    });
  }
}, An = class {
  constructor() {
    this.name = S.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}, vn = class {
  constructor() {
    this.name = S.KHR_MESH_QUANTIZATION;
  }
}, gt = class extends Qt {
  constructor(e, t, i, s) {
    super(e, t, i, s);
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, i = this.sampleValues, s = this.valueSize, n = e * s * 3 + s;
    for (let o = 0; o !== s; o++) t[o] = i[n + o];
    return t;
  }
  interpolate_(e, t, i, s) {
    const n = this.resultBuffer, o = this.sampleValues, a = this.valueSize, r = a * 2, h = a * 3, c = s - t, l = (i - t) / c, u = l * l, d = u * l, p = e * h, g = p - h, _ = -2 * d + 3 * u, b = d - u, m = 1 - _, y = b - u + l;
    for (let f = 0; f !== a; f++) {
      const R = o[g + f + a], L = o[g + f + r] * c, A = o[p + f + a], T = o[p + f] * c;
      n[f] = m * R + y * L + _ * A + b * T;
    }
    return n;
  }
}, Ln = new me(), Pn = class extends gt {
  interpolate_(e, t, i, s) {
    const n = super.interpolate_(e, t, i, s);
    return Ln.fromArray(n).normalize().toArray(n), n;
  }
}, B = {
  FLOAT: 5126,
  FLOAT_MAT3: 35675,
  FLOAT_MAT4: 35676,
  FLOAT_VEC2: 35664,
  FLOAT_VEC3: 35665,
  FLOAT_VEC4: 35666,
  LINEAR: 9729,
  REPEAT: 10497,
  SAMPLER_2D: 35678,
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
  UNSIGNED_BYTE: 5121,
  UNSIGNED_SHORT: 5123
}, ae = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, $e = {
  9728: ls,
  9729: ct,
  9984: as,
  9985: Ht,
  9986: ts,
  9987: et
}, Qe = {
  33071: Jt,
  33648: Vt,
  10497: rt
}, Ee = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Le = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, q = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, On = {
  CUBICSPLINE: void 0,
  LINEAR: it,
  STEP: xt
}, Me = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Nn(e) {
  return e.DefaultMaterial === void 0 && (e.DefaultMaterial = new Oe({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: 0
  })), e.DefaultMaterial;
}
function ee(e, t, i) {
  for (const s in i.extensions) e[s] === void 0 && (t.userData.gltfExtensions = t.userData.gltfExtensions || {}, t.userData.gltfExtensions[s] = i.extensions[s]);
}
function V(e, t) {
  t.extras !== void 0 && (typeof t.extras == "object" ? Object.assign(e.userData, t.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + t.extras));
}
function Dn(e, t, i) {
  let s = !1, n = !1, o = !1;
  for (let c = 0, l = t.length; c < l; c++) {
    const u = t[c];
    if (u.POSITION !== void 0 && (s = !0), u.NORMAL !== void 0 && (n = !0), u.COLOR_0 !== void 0 && (o = !0), s && n && o) break;
  }
  if (!s && !n && !o) return Promise.resolve(e);
  const a = [], r = [], h = [];
  for (let c = 0, l = t.length; c < l; c++) {
    const u = t[c];
    if (s) {
      const d = u.POSITION !== void 0 ? i.getDependency("accessor", u.POSITION) : e.attributes.position;
      a.push(d);
    }
    if (n) {
      const d = u.NORMAL !== void 0 ? i.getDependency("accessor", u.NORMAL) : e.attributes.normal;
      r.push(d);
    }
    if (o) {
      const d = u.COLOR_0 !== void 0 ? i.getDependency("accessor", u.COLOR_0) : e.attributes.color;
      h.push(d);
    }
  }
  return Promise.all([
    Promise.all(a),
    Promise.all(r),
    Promise.all(h)
  ]).then(function(c) {
    const l = c[0], u = c[1], d = c[2];
    return s && (e.morphAttributes.position = l), n && (e.morphAttributes.normal = u), o && (e.morphAttributes.color = d), e.morphTargetsRelative = !0, e;
  });
}
function kn(e, t) {
  if (e.updateMorphTargets(), t.weights !== void 0) for (let i = 0, s = t.weights.length; i < s; i++) e.morphTargetInfluences[i] = t.weights[i];
  if (t.extras && Array.isArray(t.extras.targetNames)) {
    const i = t.extras.targetNames;
    if (e.morphTargetInfluences.length === i.length) {
      e.morphTargetDictionary = {};
      for (let s = 0, n = i.length; s < n; s++) e.morphTargetDictionary[i[s]] = s;
    } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function In(e) {
  let t;
  const i = e.extensions && e.extensions[S.KHR_DRACO_MESH_COMPRESSION];
  if (i ? t = "draco:" + i.bufferView + ":" + i.indices + ":" + Se(i.attributes) : t = e.indices + ":" + Se(e.attributes) + ":" + e.mode, e.targets !== void 0) for (let s = 0, n = e.targets.length; s < n; s++) t += ":" + Se(e.targets[s]);
  return t;
}
function Se(e) {
  let t = "";
  const i = Object.keys(e).sort();
  for (let s = 0, n = i.length; s < n; s++) t += i[s] + ":" + e[i[s]] + ";";
  return t;
}
function Pe(e) {
  switch (e) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function Cn(e) {
  return e.search(/\.jpe?g($|\?)/i) > 0 || e.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : e.search(/\.webp($|\?)/i) > 0 || e.search(/^data\:image\/webp/) === 0 ? "image/webp" : e.search(/\.ktx2($|\?)/i) > 0 || e.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
var Fn = new K(), Un = class {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new an(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
      refs: {},
      uses: {}
    }, this.cameraCache = {
      refs: {},
      uses: {}
    }, this.lightCache = {
      refs: {},
      uses: {}
    }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let i = !1, s = -1, n = !1, o = -1;
    if (typeof navigator < "u") {
      const a = navigator.userAgent;
      i = /^((?!chrome|android).)*safari/i.test(a) === !0;
      const r = a.match(/Version\/(\d+)/);
      s = i && r ? parseInt(r[1], 10) : -1, n = a.indexOf("Firefox") > -1, o = n ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || i && s < 17 || n && o < 98 ? this.textureLoader = new Nt(this.options.manager) : this.textureLoader = new ds(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new at(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, t) {
    const i = this, s = this.json, n = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(o) {
      return o._markDefs && o._markDefs();
    }), Promise.all(this._invokeAll(function(o) {
      return o.beforeRoot && o.beforeRoot();
    })).then(function() {
      return Promise.all([
        i.getDependencies("scene"),
        i.getDependencies("animation"),
        i.getDependencies("camera")
      ]);
    }).then(function(o) {
      const a = {
        scene: o[0][s.scene || 0],
        scenes: o[0],
        animations: o[1],
        cameras: o[2],
        asset: s.asset,
        parser: i,
        userData: {}
      };
      return ee(n, a, s), V(a, s), Promise.all(i._invokeAll(function(r) {
        return r.afterRoot && r.afterRoot(a);
      })).then(function() {
        for (const r of a.scenes) r.updateMatrixWorld();
        e(a);
      });
    }).catch(t);
  }
  _markDefs() {
    const e = this.json.nodes || [], t = this.json.skins || [], i = this.json.meshes || [];
    for (let s = 0, n = t.length; s < n; s++) {
      const o = t[s].joints;
      for (let a = 0, r = o.length; a < r; a++) e[o[a]].isBone = !0;
    }
    for (let s = 0, n = e.length; s < n; s++) {
      const o = e[s];
      o.mesh !== void 0 && (this._addNodeRef(this.meshCache, o.mesh), o.skin !== void 0 && (i[o.mesh].isSkinnedMesh = !0)), o.camera !== void 0 && this._addNodeRef(this.cameraCache, o.camera);
    }
  }
  _addNodeRef(e, t) {
    t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++);
  }
  _getNodeRef(e, t, i) {
    if (e.refs[t] <= 1) return i;
    const s = i.clone(), n = (o, a) => {
      const r = this.associations.get(o);
      r != null && this.associations.set(a, r);
      for (const [h, c] of o.children.entries()) n(c, a.children[h]);
    };
    return n(i, s), s.name += "_instance_" + e.uses[t]++, s;
  }
  _invokeOne(e) {
    const t = Object.values(this.plugins);
    t.push(this);
    for (let i = 0; i < t.length; i++) {
      const s = e(t[i]);
      if (s) return s;
    }
    return null;
  }
  _invokeAll(e) {
    const t = Object.values(this.plugins);
    t.unshift(this);
    const i = [];
    for (let s = 0; s < t.length; s++) {
      const n = e(t[s]);
      n && i.push(n);
    }
    return i;
  }
  getDependency(e, t) {
    const i = e + ":" + t;
    let s = this.cache.get(i);
    if (!s) {
      switch (e) {
        case "scene":
          s = this.loadScene(t);
          break;
        case "node":
          s = this._invokeOne(function(n) {
            return n.loadNode && n.loadNode(t);
          });
          break;
        case "mesh":
          s = this._invokeOne(function(n) {
            return n.loadMesh && n.loadMesh(t);
          });
          break;
        case "accessor":
          s = this.loadAccessor(t);
          break;
        case "bufferView":
          s = this._invokeOne(function(n) {
            return n.loadBufferView && n.loadBufferView(t);
          });
          break;
        case "buffer":
          s = this.loadBuffer(t);
          break;
        case "material":
          s = this._invokeOne(function(n) {
            return n.loadMaterial && n.loadMaterial(t);
          });
          break;
        case "texture":
          s = this._invokeOne(function(n) {
            return n.loadTexture && n.loadTexture(t);
          });
          break;
        case "skin":
          s = this.loadSkin(t);
          break;
        case "animation":
          s = this._invokeOne(function(n) {
            return n.loadAnimation && n.loadAnimation(t);
          });
          break;
        case "camera":
          s = this.loadCamera(t);
          break;
        default:
          if (s = this._invokeOne(function(n) {
            return n != this && n.getDependency && n.getDependency(e, t);
          }), !s) throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(i, s);
    }
    return s;
  }
  getDependencies(e) {
    let t = this.cache.get(e);
    if (!t) {
      const i = this, s = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      t = Promise.all(s.map(function(n, o) {
        return i.getDependency(e, o);
      })), this.cache.add(e, t);
    }
    return t;
  }
  loadBuffer(e) {
    const t = this.json.buffers[e], i = this.fileLoader;
    if (t.type && t.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
    if (t.uri === void 0 && e === 0) return Promise.resolve(this.extensions[S.KHR_BINARY_GLTF].body);
    const s = this.options;
    return new Promise(function(n, o) {
      i.load(ue.resolveURL(t.uri, s.path), n, void 0, function() {
        o(/* @__PURE__ */ new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'));
      });
    });
  }
  loadBufferView(e) {
    const t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function(i) {
      const s = t.byteLength || 0, n = t.byteOffset || 0;
      return i.slice(n, n + s);
    });
  }
  loadAccessor(e) {
    const t = this, i = this.json, s = this.json.accessors[e];
    if (s.bufferView === void 0 && s.sparse === void 0) {
      const o = Ee[s.type], a = ae[s.componentType], r = s.normalized === !0, h = new a(s.count * o);
      return Promise.resolve(new we(h, o, r));
    }
    const n = [];
    return s.bufferView !== void 0 ? n.push(this.getDependency("bufferView", s.bufferView)) : n.push(null), s.sparse !== void 0 && (n.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), n.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(n).then(function(o) {
      const a = o[0], r = Ee[s.type], h = ae[s.componentType], c = h.BYTES_PER_ELEMENT, l = c * r, u = s.byteOffset || 0, d = s.bufferView !== void 0 ? i.bufferViews[s.bufferView].byteStride : void 0, p = s.normalized === !0;
      let g, _;
      if (d && d !== l) {
        const b = Math.floor(u / d), m = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + b + ":" + s.count;
        let y = t.cache.get(m);
        y || (g = new h(a, b * d, s.count * d / c), y = new St(g, d / c), t.cache.add(m, y)), _ = new Dt(y, r, u % d / c, p);
      } else
        a === null ? g = new h(s.count * r) : g = new h(a, u, s.count * r), _ = new we(g, r, p);
      if (s.sparse !== void 0) {
        const b = Ee.SCALAR, m = ae[s.sparse.indices.componentType], y = s.sparse.indices.byteOffset || 0, f = s.sparse.values.byteOffset || 0, R = new m(o[1], y, s.sparse.count * b), L = new h(o[2], f, s.sparse.count * r);
        a !== null && (_ = new we(_.array.slice(), _.itemSize, _.normalized)), _.normalized = !1;
        for (let A = 0, T = R.length; A < T; A++) {
          const x = R[A];
          if (_.setX(x, L[A * r]), r >= 2 && _.setY(x, L[A * r + 1]), r >= 3 && _.setZ(x, L[A * r + 2]), r >= 4 && _.setW(x, L[A * r + 3]), r >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        _.normalized = p;
      }
      return _;
    });
  }
  loadTexture(e) {
    const t = this.json, i = this.options, s = t.textures[e].source, n = t.images[s];
    let o = this.textureLoader;
    if (n.uri) {
      const a = i.manager.getHandler(n.uri);
      a !== null && (o = a);
    }
    return this.loadTextureImage(e, s, o);
  }
  loadTextureImage(e, t, i) {
    const s = this, n = this.json, o = n.textures[e], a = n.images[t], r = (a.uri || a.bufferView) + ":" + o.sampler;
    if (this.textureCache[r]) return this.textureCache[r];
    const h = this.loadImageSource(t, i).then(function(c) {
      c.flipY = !1, c.name = o.name || a.name || "", c.name === "" && typeof a.uri == "string" && a.uri.startsWith("data:image/") === !1 && (c.name = a.uri);
      const l = (n.samplers || {})[o.sampler] || {};
      return c.magFilter = $e[l.magFilter] || 1006, c.minFilter = $e[l.minFilter] || 1008, c.wrapS = Qe[l.wrapS] || 1e3, c.wrapT = Qe[l.wrapT] || 1e3, c.generateMipmaps = !c.isCompressedTexture && c.minFilter !== 1003 && c.minFilter !== 1006, s.associations.set(c, { textures: e }), c;
    }).catch(function() {
      return null;
    });
    return this.textureCache[r] = h, h;
  }
  loadImageSource(e, t) {
    const i = this, s = this.json, n = this.options;
    if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then((l) => l.clone());
    const o = s.images[e], a = self.URL || self.webkitURL;
    let r = o.uri || "", h = !1;
    if (o.bufferView !== void 0) r = i.getDependency("bufferView", o.bufferView).then(function(l) {
      h = !0;
      const u = new Blob([l], { type: o.mimeType });
      return r = a.createObjectURL(u), r;
    });
    else if (o.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const c = Promise.resolve(r).then(function(l) {
      return new Promise(function(u, d) {
        let p = u;
        t.isImageBitmapLoader === !0 && (p = function(g) {
          const _ = new Ue(g);
          _.needsUpdate = !0, u(_);
        }), t.load(ue.resolveURL(l, n.path), p, void 0, d);
      });
    }).then(function(l) {
      return h === !0 && a.revokeObjectURL(r), V(l, o), l.userData.mimeType = o.mimeType || Cn(o.uri), l;
    }).catch(function(l) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", r), l;
    });
    return this.sourceCache[e] = c, c;
  }
  assignTexture(e, t, i, s) {
    const n = this;
    return this.getDependency("texture", i.index).then(function(o) {
      if (!o) return null;
      if (i.texCoord !== void 0 && i.texCoord > 0 && (o = o.clone(), o.channel = i.texCoord), n.extensions[S.KHR_TEXTURE_TRANSFORM]) {
        const a = i.extensions !== void 0 ? i.extensions[S.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          const r = n.associations.get(o);
          o = n.extensions[S.KHR_TEXTURE_TRANSFORM].extendTexture(o, a), n.associations.set(o, r);
        }
      }
      return s !== void 0 && (o.colorSpace = s), e[t] = o, o;
    });
  }
  assignFinalMaterial(e) {
    const t = e.geometry;
    let i = e.material;
    const s = t.attributes.tangent === void 0, n = t.attributes.color !== void 0, o = t.attributes.normal === void 0;
    if (e.isPoints) {
      const a = "PointsMaterial:" + i.uuid;
      let r = this.cache.get(a);
      r || (r = new Wt(), Te.prototype.copy.call(r, i), r.color.copy(i.color), r.map = i.map, r.sizeAttenuation = !1, this.cache.add(a, r)), i = r;
    } else if (e.isLine) {
      const a = "LineBasicMaterial:" + i.uuid;
      let r = this.cache.get(a);
      r || (r = new vt(), Te.prototype.copy.call(r, i), r.color.copy(i.color), r.map = i.map, this.cache.add(a, r)), i = r;
    }
    if (s || n || o) {
      let a = "ClonedMaterial:" + i.uuid + ":";
      s && (a += "derivative-tangents:"), n && (a += "vertex-colors:"), o && (a += "flat-shading:");
      let r = this.cache.get(a);
      r || (r = i.clone(), n && (r.vertexColors = !0), o && (r.flatShading = !0), s && (r.normalScale && (r.normalScale.y *= -1), r.clearcoatNormalScale && (r.clearcoatNormalScale.y *= -1)), this.cache.add(a, r), this.associations.set(r, this.associations.get(i))), i = r;
    }
    e.material = i;
  }
  getMaterialType() {
    return Oe;
  }
  loadMaterial(e) {
    const t = this, i = this.json, s = this.extensions, n = i.materials[e];
    let o;
    const a = {}, r = n.extensions || {}, h = [];
    if (r[S.KHR_MATERIALS_UNLIT]) {
      const l = s[S.KHR_MATERIALS_UNLIT];
      o = l.getMaterialType(), h.push(l.extendParams(a, n, t));
    } else {
      const l = n.pbrMetallicRoughness || {};
      if (a.color = new W(1, 1, 1), a.opacity = 1, Array.isArray(l.baseColorFactor)) {
        const u = l.baseColorFactor;
        a.color.setRGB(u[0], u[1], u[2], Q), a.opacity = u[3];
      }
      l.baseColorTexture !== void 0 && h.push(t.assignTexture(a, "map", l.baseColorTexture, ne)), a.metalness = l.metallicFactor !== void 0 ? l.metallicFactor : 1, a.roughness = l.roughnessFactor !== void 0 ? l.roughnessFactor : 1, l.metallicRoughnessTexture !== void 0 && (h.push(t.assignTexture(a, "metalnessMap", l.metallicRoughnessTexture)), h.push(t.assignTexture(a, "roughnessMap", l.metallicRoughnessTexture))), o = this._invokeOne(function(u) {
        return u.getMaterialType && u.getMaterialType(e);
      }), h.push(Promise.all(this._invokeAll(function(u) {
        return u.extendMaterialParams && u.extendMaterialParams(e, a);
      })));
    }
    n.doubleSided === !0 && (a.side = 2);
    const c = n.alphaMode || Me.OPAQUE;
    if (c === Me.BLEND ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, c === Me.MASK && (a.alphaTest = n.alphaCutoff !== void 0 ? n.alphaCutoff : 0.5)), n.normalTexture !== void 0 && o !== he && (h.push(t.assignTexture(a, "normalMap", n.normalTexture)), a.normalScale = new N(1, 1), n.normalTexture.scale !== void 0)) {
      const l = n.normalTexture.scale;
      a.normalScale.set(l, l);
    }
    if (n.occlusionTexture !== void 0 && o !== he && (h.push(t.assignTexture(a, "aoMap", n.occlusionTexture)), n.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = n.occlusionTexture.strength)), n.emissiveFactor !== void 0 && o !== he) {
      const l = n.emissiveFactor;
      a.emissive = new W().setRGB(l[0], l[1], l[2], Q);
    }
    return n.emissiveTexture !== void 0 && o !== he && h.push(t.assignTexture(a, "emissiveMap", n.emissiveTexture, ne)), Promise.all(h).then(function() {
      const l = new o(a);
      return n.name && (l.name = n.name), V(l, n), t.associations.set(l, { materials: e }), n.extensions && ee(s, l, n), l;
    });
  }
  createUniqueName(e) {
    const t = is.sanitizeNodeName(e || "");
    return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t);
  }
  loadGeometries(e) {
    const t = this, i = this.extensions, s = this.primitiveCache;
    function n(a) {
      return i[S.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, t).then(function(r) {
        return Je(r, a, t);
      });
    }
    const o = [];
    for (let a = 0, r = e.length; a < r; a++) {
      const h = e[a], c = In(h), l = s[c];
      if (l) o.push(l.promise);
      else {
        let u;
        h.extensions && h.extensions[S.KHR_DRACO_MESH_COMPRESSION] ? u = n(h) : u = Je(new Ne(), h, t), s[c] = {
          primitive: h,
          promise: u
        }, o.push(u);
      }
    }
    return Promise.all(o);
  }
  loadMesh(e) {
    const t = this, i = this.json, s = this.extensions, n = i.meshes[e], o = n.primitives, a = [];
    for (let r = 0, h = o.length; r < h; r++) {
      const c = o[r].material === void 0 ? Nn(this.cache) : this.getDependency("material", o[r].material);
      a.push(c);
    }
    return a.push(t.loadGeometries(o)), Promise.all(a).then(function(r) {
      const h = r.slice(0, r.length - 1), c = r[r.length - 1], l = [];
      for (let d = 0, p = c.length; d < p; d++) {
        const g = c[d], _ = o[d];
        let b;
        const m = h[d];
        if (_.mode === B.TRIANGLES || _.mode === B.TRIANGLE_STRIP || _.mode === B.TRIANGLE_FAN || _.mode === void 0)
          b = n.isSkinnedMesh === !0 ? new At(g, m) : new pe(g, m), b.isSkinnedMesh === !0 && b.normalizeSkinWeights(), _.mode === B.TRIANGLE_STRIP ? b.geometry = Ze(b.geometry, 1) : _.mode === B.TRIANGLE_FAN && (b.geometry = Ze(b.geometry, 2));
        else if (_.mode === B.LINES) b = new kt(g, m);
        else if (_.mode === B.LINE_STRIP) b = new st(g, m);
        else if (_.mode === B.LINE_LOOP) b = new Pt(g, m);
        else if (_.mode === B.POINTS) b = new Xt(g, m);
        else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + _.mode);
        Object.keys(b.geometry.morphAttributes).length > 0 && kn(b, n), b.name = t.createUniqueName(n.name || "mesh_" + e), V(b, n), _.extensions && ee(s, b, _), t.assignFinalMaterial(b), l.push(b);
      }
      for (let d = 0, p = l.length; d < p; d++) t.associations.set(l[d], {
        meshes: e,
        primitives: d
      });
      if (l.length === 1)
        return n.extensions && ee(s, l[0], n), l[0];
      const u = new de();
      n.extensions && ee(s, u, n), t.associations.set(u, { meshes: e });
      for (let d = 0, p = l.length; d < p; d++) u.add(l[d]);
      return u;
    });
  }
  loadCamera(e) {
    let t;
    const i = this.json.cameras[e], s = i[i.type];
    if (!s) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return i.type === "perspective" ? t = new rs(ge.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : i.type === "orthographic" && (t = new ot(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), i.name && (t.name = this.createUniqueName(i.name)), V(t, i), Promise.resolve(t);
  }
  loadSkin(e) {
    const t = this.json.skins[e], i = [];
    for (let s = 0, n = t.joints.length; s < n; s++) i.push(this._loadNodeShallow(t.joints[s]));
    return t.inverseBindMatrices !== void 0 ? i.push(this.getDependency("accessor", t.inverseBindMatrices)) : i.push(null), Promise.all(i).then(function(s) {
      const n = s.pop(), o = s, a = [], r = [];
      for (let h = 0, c = o.length; h < c; h++) {
        const l = o[h];
        if (l) {
          a.push(l);
          const u = new K();
          n !== null && u.fromArray(n.array, h * 16), r.push(u);
        } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[h]);
      }
      return new Ut(a, r);
    });
  }
  loadAnimation(e) {
    const t = this.json, i = this, s = t.animations[e], n = s.name ? s.name : "animation_" + e, o = [], a = [], r = [], h = [], c = [];
    for (let l = 0, u = s.channels.length; l < u; l++) {
      const d = s.channels[l], p = s.samplers[d.sampler], g = d.target, _ = g.node, b = s.parameters !== void 0 ? s.parameters[p.input] : p.input, m = s.parameters !== void 0 ? s.parameters[p.output] : p.output;
      g.node !== void 0 && (o.push(this.getDependency("node", _)), a.push(this.getDependency("accessor", b)), r.push(this.getDependency("accessor", m)), h.push(p), c.push(g));
    }
    return Promise.all([
      Promise.all(o),
      Promise.all(a),
      Promise.all(r),
      Promise.all(h),
      Promise.all(c)
    ]).then(function(l) {
      const u = l[0], d = l[1], p = l[2], g = l[3], _ = l[4], b = [];
      for (let y = 0, f = u.length; y < f; y++) {
        const R = u[y], L = d[y], A = p[y], T = g[y], x = _[y];
        if (R === void 0) continue;
        R.updateMatrix && R.updateMatrix();
        const F = i._createAnimationTracks(R, L, A, T, x);
        if (F) for (let U = 0; U < F.length; U++) b.push(F[U]);
      }
      const m = new os(n, void 0, b);
      return V(m, s), m;
    });
  }
  createNodeMesh(e) {
    const t = this.json, i = this, s = t.nodes[e];
    return s.mesh === void 0 ? null : i.getDependency("mesh", s.mesh).then(function(n) {
      const o = i._getNodeRef(i.meshCache, s.mesh, n);
      return s.weights !== void 0 && o.traverse(function(a) {
        if (a.isMesh)
          for (let r = 0, h = s.weights.length; r < h; r++) a.morphTargetInfluences[r] = s.weights[r];
      }), o;
    });
  }
  loadNode(e) {
    const t = this.json, i = this, s = t.nodes[e], n = i._loadNodeShallow(e), o = [], a = s.children || [];
    for (let h = 0, c = a.length; h < c; h++) o.push(i.getDependency("node", a[h]));
    const r = s.skin === void 0 ? Promise.resolve(null) : i.getDependency("skin", s.skin);
    return Promise.all([
      n,
      Promise.all(o),
      r
    ]).then(function(h) {
      const c = h[0], l = h[1], u = h[2];
      u !== null && c.traverse(function(d) {
        d.isSkinnedMesh && d.bind(u, Fn);
      });
      for (let d = 0, p = l.length; d < p; d++) c.add(l[d]);
      return c;
    });
  }
  _loadNodeShallow(e) {
    const t = this.json, i = this.extensions, s = this;
    if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
    const n = t.nodes[e], o = n.name ? s.createUniqueName(n.name) : "", a = [], r = s._invokeOne(function(h) {
      return h.createNodeMesh && h.createNodeMesh(e);
    });
    return r && a.push(r), n.camera !== void 0 && a.push(s.getDependency("camera", n.camera).then(function(h) {
      return s._getNodeRef(s.cameraCache, n.camera, h);
    })), s._invokeAll(function(h) {
      return h.createNodeAttachment && h.createNodeAttachment(e);
    }).forEach(function(h) {
      a.push(h);
    }), this.nodeCache[e] = Promise.all(a).then(function(h) {
      let c;
      if (n.isBone === !0 ? c = new $t() : h.length > 1 ? c = new de() : h.length === 1 ? c = h[0] : c = new nt(), c !== h[0]) for (let l = 0, u = h.length; l < u; l++) c.add(h[l]);
      if (n.name && (c.userData.name = n.name, c.name = o), V(c, n), n.extensions && ee(i, c, n), n.matrix !== void 0) {
        const l = new K();
        l.fromArray(n.matrix), c.applyMatrix4(l);
      } else
        n.translation !== void 0 && c.position.fromArray(n.translation), n.rotation !== void 0 && c.quaternion.fromArray(n.rotation), n.scale !== void 0 && c.scale.fromArray(n.scale);
      if (!s.associations.has(c)) s.associations.set(c, {});
      else if (n.mesh !== void 0 && s.meshCache.refs[n.mesh] > 1) {
        const l = s.associations.get(c);
        s.associations.set(c, { ...l });
      }
      return s.associations.get(c).nodes = e, c;
    }), this.nodeCache[e];
  }
  loadScene(e) {
    const t = this.extensions, i = this.json.scenes[e], s = this, n = new de();
    i.name && (n.name = s.createUniqueName(i.name)), V(n, i), i.extensions && ee(t, n, i);
    const o = i.nodes || [], a = [];
    for (let r = 0, h = o.length; r < h; r++) a.push(s.getDependency("node", o[r]));
    return Promise.all(a).then(function(r) {
      for (let c = 0, l = r.length; c < l; c++) n.add(r[c]);
      const h = (c) => {
        const l = /* @__PURE__ */ new Map();
        for (const [u, d] of s.associations) (u instanceof Te || u instanceof Ue) && l.set(u, d);
        return c.traverse((u) => {
          const d = s.associations.get(u);
          d != null && l.set(u, d);
        }), l;
      };
      return s.associations = h(n), n;
    });
  }
  _createAnimationTracks(e, t, i, s, n) {
    const o = [], a = e.name ? e.name : e.uuid, r = [];
    q[n.path] === q.weights ? e.traverse(function(u) {
      u.morphTargetInfluences && r.push(u.name ? u.name : u.uuid);
    }) : r.push(a);
    let h;
    switch (q[n.path]) {
      case q.weights:
        h = Ge;
        break;
      case q.rotation:
        h = He;
        break;
      case q.translation:
      case q.scale:
        h = Fe;
        break;
      default:
        i.itemSize === 1 ? h = Ge : h = Fe;
        break;
    }
    const c = s.interpolation !== void 0 ? On[s.interpolation] : it, l = this._getArrayFromAccessor(i);
    for (let u = 0, d = r.length; u < d; u++) {
      const p = new h(r[u] + "." + q[n.path], t.array, l, c);
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(p), o.push(p);
    }
    return o;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const i = Pe(t.constructor), s = new Float32Array(t.length);
      for (let n = 0, o = t.length; n < o; n++) s[n] = t[n] * i;
      t = s;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(i) {
      return new (this instanceof He ? Pn : gt)(this.times, this.values, this.getValueSize() / 3, i);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
};
function jn(e, t, i) {
  const s = t.attributes, n = new te();
  if (s.POSITION !== void 0) {
    const r = i.json.accessors[s.POSITION], h = r.min, c = r.max;
    if (h !== void 0 && c !== void 0) {
      if (n.set(new v(h[0], h[1], h[2]), new v(c[0], c[1], c[2])), r.normalized) {
        const l = Pe(ae[r.componentType]);
        n.min.multiplyScalar(l), n.max.multiplyScalar(l);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else return;
  const o = t.targets;
  if (o !== void 0) {
    const r = new v(), h = new v();
    for (let c = 0, l = o.length; c < l; c++) {
      const u = o[c];
      if (u.POSITION !== void 0) {
        const d = i.json.accessors[u.POSITION], p = d.min, g = d.max;
        if (p !== void 0 && g !== void 0) {
          if (h.setX(Math.max(Math.abs(p[0]), Math.abs(g[0]))), h.setY(Math.max(Math.abs(p[1]), Math.abs(g[1]))), h.setZ(Math.max(Math.abs(p[2]), Math.abs(g[2]))), d.normalized) {
            const _ = Pe(ae[d.componentType]);
            h.multiplyScalar(_);
          }
          r.max(h);
        } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    n.expandByVector(r);
  }
  e.boundingBox = n;
  const a = new Rt();
  n.getCenter(a.center), a.radius = n.min.distanceTo(n.max) / 2, e.boundingSphere = a;
}
function Je(e, t, i) {
  const s = t.attributes, n = [];
  function o(a, r) {
    return i.getDependency("accessor", a).then(function(h) {
      e.setAttribute(r, h);
    });
  }
  for (const a in s) {
    const r = Le[a] || a.toLowerCase();
    r in e.attributes || n.push(o(s[a], r));
  }
  if (t.indices !== void 0 && !e.index) {
    const a = i.getDependency("accessor", t.indices).then(function(r) {
      e.setIndex(r);
    });
    n.push(a);
  }
  return je.workingColorSpace !== "srgb-linear" && "COLOR_0" in s && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${je.workingColorSpace}" not supported.`), V(e, t), jn(e, t, i), Promise.all(n).then(function() {
    return t.targets !== void 0 ? Dn(e, t.targets, i) : e;
  });
}
async function Hn(e) {
  const { scene: t } = await new on().parseAsync(e, ""), i = new ht(), s = [], n = new te().setFromObject(t).getSize(new v());
  let o = 0;
  return t.traverse((a) => {
    if (!(a instanceof pe)) return;
    i.own(a.geometry);
    const r = Array.isArray(a.material) ? a.material : [a.material];
    r.forEach((c) => i.own(c)), s.push({
      geometry: a.geometry,
      role: r[0].name
    });
    const h = a.geometry.getAttribute("position");
    for (let c = 0; c < h.count; c++) o = Math.max(o, Math.hypot(h.getX(c), h.getZ(c)));
  }), {
    parts: s,
    size: n,
    radius: o,
    dispose: () => {
      i.dispose(), t.clear();
    }
  };
}
function Gn(e, t, i) {
  const s = /* @__PURE__ */ new Map();
  let n = !1;
  function o(a) {
    const r = s.get(a);
    s.delete(a), r?.abort.abort(), r?.asset?.dispose();
  }
  return {
    get: (a) => s.get(a)?.asset,
    sync(a) {
      if (n) return;
      const r = new Set(a);
      for (const h of s.keys()) r.has(h) || o(h);
      for (const h of r) {
        if (s.has(h)) continue;
        const c = {
          abort: new AbortController(),
          asset: void 0
        };
        s.set(h, c), e(h, c.abort.signal).then((l) => {
          if (s.get(h) !== c) {
            l.dispose();
            return;
          }
          c.asset = l, t();
        }).catch((l) => {
          s.get(h) === c && i(h, l);
        });
      }
    },
    dispose() {
      n = !0;
      for (const a of s.keys()) o(a);
    }
  };
}
var Bn = "" + new URL("map-assets/table-BYH2YAbI.glb", import.meta.url).href, zn = "" + new URL("map-assets/chairRounded-CAXjIAhg.glb", import.meta.url).href, Kn = "" + new URL("map-assets/bedSingle-DQi3T5hW.glb", import.meta.url).href, Xn = "" + new URL("map-assets/bookcaseOpenLow-D5KCefka.glb", import.meta.url).href, Vn = "" + new URL("map-assets/tree_oak-BfHnIhp4.glb", import.meta.url).href, Yn = "" + new URL("map-assets/stone_largeE-BlCexUuF.glb", import.meta.url).href, Wn = "" + new URL("map-assets/stoolBar-K3cU9Dzt.glb", import.meta.url).href, Zn = "" + new URL("map-assets/bench-Bgad_ueP.glb", import.meta.url).href, qn = "" + new URL("map-assets/loungeSofa-B4ImPSPA.glb", import.meta.url).href, $n = "" + new URL("map-assets/kitchenCabinet-DDG9MLaC.glb", import.meta.url).href, Qn = "" + new URL("map-assets/chest-5wu5Viff.glb", import.meta.url).href, Jn = "" + new URL("map-assets/barrel-CTYVDd_z.glb", import.meta.url).href, ei = "" + new URL("map-assets/kitchenStove-RyR0iXNj.glb", import.meta.url).href, ti = "" + new URL("map-assets/kitchenFridge-DWiEo7GA.glb", import.meta.url).href, si = "" + new URL("map-assets/kitchenSink-BX1FOFLO.glb", import.meta.url).href, ni = "" + new URL("map-assets/toilet-Lah8VaC1.glb", import.meta.url).href, ii = "" + new URL("map-assets/bathtub-CbRYKtGX.glb", import.meta.url).href, oi = "" + new URL("map-assets/sedan-CvNIPylJ.glb", import.meta.url).href, ai = "" + new URL("map-assets/statue_ring-MbjedqWU.glb", import.meta.url).href, ri = "" + new URL("map-assets/tent-canvas-DmLjTNyB.glb", import.meta.url).href, ci = "" + new URL("map-assets/pottedPlant-B8kIu3Qg.glb", import.meta.url).href, li = "" + new URL("map-assets/lampRoundFloor-DO1FJkPg.glb", import.meta.url).href, hi = {
  table: Bn,
  chair: zn,
  bed: Kn,
  shelf: Xn,
  tree: Vn,
  rock: Yn,
  stool: Wn,
  bench: Zn,
  sofa: qn,
  cabinet: $n,
  chest: Qn,
  barrel: Jn,
  stove: ei,
  refrigerator: ti,
  sink: si,
  toilet: ni,
  bathtub: ii,
  car: oi,
  statue: ai,
  tent: ri,
  "potted-plant": ci,
  light: li
};
function mi(e, t, i) {
  let s, n, o, a, r, h, c, l, u = !1, d = !1, p = !0, g = 0, _ = 0, b = !0, m = !1, y = !1, f, R = 14, L = 14;
  const A = new AbortController(), T = new Ct(), x = new ot(-10, 10, 10, -10, 0.01, 1e3), F = new N(), U = new It("#f5f8ff", "#9c8c7a", 1.65), w = new Re("#fff3df", 3.1);
  w.castShadow = !0, w.shadow.mapSize.set(1024, 1024), w.shadow.normalBias = 0.012, w.shadow.bias = -15e-5, w.shadow.radius = 2;
  const O = new Re("#daeaff", 0.65);
  T.add(U, w, w.target, O);
  const I = () => !!e.closest(".theme-dark");
  let H = I();
  const X = Ts(bt, () => !u && !d && p && g > 0 && _ > 0), Z = X.cancel;
  function ie() {
    u || (u = !0, Z(), A.abort(), h?.disconnect(), c?.disconnect(), l?.disconnect(), n?.dispose(), r?.dispose(), o?.dispose(), a?.dispose(), w.shadow.dispose(), s?.dispose(), s?.forceContextLoss(), s?.domElement.remove(), T.clear());
  }
  function ce(M) {
    u || d || (d = !0, Z(), i.fallback(M));
  }
  function z() {
    X.request();
  }
  function bt() {
    try {
      s.getSize(F), (F.x !== g || F.y !== _) && s.setSize(g, _, !1), s.render(T, x), r?.update(x, g, _, b);
    } catch {
      ce("三维画面暂不可用，已切换二维。");
    }
  }
  function ke() {
    const [M, E, D, C] = f.viewBox, { frame: G } = o;
    return new te(G.point(M, E), G.point(M + D, E + C)).union(o.bounds);
  }
  function yt() {
    const M = ke(), E = M.getCenter(new v()), D = Math.max(1, M.getSize(new v()).length());
    w.position.copy(E).add(new v(-D / 2, D, D / 2)), w.target.position.copy(E), O.position.copy(E).add(new v(D, D / 2, -D)), w.updateMatrixWorld(!0), w.target.updateMatrixWorld(!0), w.shadow.updateMatrices(w);
    const C = M.clone().applyMatrix4(w.shadow.camera.matrixWorldInverse);
    Object.assign(w.shadow.camera, {
      left: C.min.x - 0.3,
      right: C.max.x + 0.3,
      top: C.max.y + 0.3,
      bottom: C.min.y - 0.3,
      near: Math.max(0.01, -C.max.z - 1),
      far: -C.min.z + 1
    }), w.shadow.camera.updateProjectionMatrix(), w.shadow.needsUpdate = !0;
  }
  function be() {
    if (!n || !o) return;
    const M = ke(), E = M.getCenter(new v()), D = Math.max(1, M.getSize(new v()).length());
    n.target.copy(E), x.position.copy(E).add(new v(9, 13, 15).normalize().multiplyScalar(D * 2)), x.near = D / 1e3, x.far = D * 6, x.lookAt(E), x.updateMatrixWorld(!0);
    let C = 0, G = 0;
    for (const _t of [M.min.x, M.max.x]) for (const Tt of [M.min.y, M.max.y]) for (const wt of [M.min.z, M.max.z]) {
      const Ce = new v(_t, Tt, wt).applyMatrix4(x.matrixWorldInverse);
      C = Math.max(C, Math.abs(Ce.x)), G = Math.max(G, Math.abs(Ce.y));
    }
    R = C, L = G;
    const J = Math.max(L, R / (g / _ || 1)) * 1.09;
    x.top = J, x.bottom = -J, x.left = -J * (g / _ || 1), x.right = -x.left, x.zoom = 1, x.updateProjectionMatrix(), n.update(), z();
  }
  function Ie() {
    if (u) return;
    const M = e.getBoundingClientRect();
    if (g = M.width, _ = M.height, g <= 0 || _ <= 0) {
      Z();
      return;
    }
    x.top = Math.max(L, R / (g / _)) * 1.09, x.bottom = -x.top, x.left = -x.top * g / _, x.right = -x.left, x.updateProjectionMatrix(), z();
  }
  function ye(M) {
    if (!(u || d))
      try {
        const E = f?.key !== M.key;
        E && (o?.dispose(), o = void 0, a?.dispose(), a = Gn(async (C, G) => {
          const J = await fetch(hi[C], { signal: G });
          if (!J.ok) throw new Error(`HTTP ${J.status}`);
          return Hn(await J.arrayBuffer());
        }, () => {
          f && ye(f);
        }, (C, G) => console.warn(`[Map 3D] ${C}: keeping procedural shape`, G)));
        const D = tn(M, H, a, E ? void 0 : o?.frame);
        r?.dispose(), o?.dispose(), f = M, o = D, T.add(o.group), o.updateWalls(m), r = nn(t, M, o.anchors), r.symbols(y), yt(), E && be(), a?.sync(M.elements.flatMap((C) => {
          const G = ft(C);
          return G ? [G] : [];
        })), z();
      } catch {
        ce("这个场景暂时无法立体显示，已切换二维。");
      }
  }
  function _e(M) {
    x.zoom = ge.clamp(x.zoom * M, 0.4, 6), x.updateProjectionMatrix(), z();
  }
  try {
    s = new cs({
      antialias: !0,
      alpha: !0,
      powerPreference: "low-power"
    }), s.setPixelRatio(ws()), s.setClearColor(0, 0), s.outputColorSpace = ne, s.toneMapping = 7, s.toneMappingExposure = 1.1, s.shadowMap.enabled = !0, s.shadowMap.type = 2, s.debug.onShaderError = () => ce("图形驱动无法绘制三维，已切换二维。");
    const M = s.domElement;
    M.setAttribute("aria-label", "三维场景：左键拖动旋转，Shift + 左键拖动平移，滚轮缩放；单指平移，双指拖动旋转、捏合缩放；方向键旋转，Home 全图"), M.title = "左键拖动旋转 · Shift + 左键拖动平移 · 滚轮缩放", M.setAttribute("role", "group"), M.tabIndex = 0, e.prepend(M), n = new Es(x, M), n.mouseButtons.RIGHT = null, n.touches = {
      ONE: $.PAN,
      TWO: $.DOLLY_ROTATE
    }, n.enableDamping = !1, n.minPolarAngle = 0.08, n.maxPolarAngle = Math.PI * 0.46, n.minZoom = 0.4, n.maxZoom = 6, n.rotateSpeed = 0.65, n.zoomSpeed = 0.8, n.addEventListener("change", z), M.addEventListener("webglcontextlost", (E) => {
      E.preventDefault(), ce("图形连接已中断，已切换二维。重新打开地图可重试。");
    }, { signal: A.signal }), M.addEventListener("keydown", (E) => {
      if (!(E.ctrlKey || E.metaKey || E.altKey)) {
        if (E.key === "Home") be();
        else if (E.key === "+" || E.key === "=") _e(1.2);
        else if (E.key === "-") _e(1 / 1.2);
        else if ([
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ].includes(E.key)) {
          const D = new Ae().setFromVector3(x.position.clone().sub(n.target));
          D.theta += E.key === "ArrowLeft" ? -0.13 : E.key === "ArrowRight" ? 0.13 : 0, D.phi = ge.clamp(D.phi + (E.key === "ArrowUp" ? -0.1 : E.key === "ArrowDown" ? 0.1 : 0), n.minPolarAngle, n.maxPolarAngle), x.position.copy(n.target).add(new v().setFromSpherical(D)), n.update(), z();
        } else return;
        E.preventDefault();
      }
    }, { signal: A.signal }), h = new ResizeObserver(() => {
      try {
        Ie();
      } catch {
        ce("三维画面尺寸调整失败，已切换二维。");
      }
    }), h.observe(e), Ie(), c = new IntersectionObserver((E) => {
      p = E[0].isIntersecting, p ? z() : Z();
    }), c.observe(e), document.addEventListener("visibilitychange", () => {
      document.hidden ? Z() : z();
    }, { signal: A.signal }), l = new MutationObserver(() => {
      const E = I();
      E !== H && (H = E, f && ye(f));
    });
    for (let E = e; E; E = E.parentElement) l.observe(E, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    return {
      dispose: ie,
      setScene: ye,
      fit: be,
      zoom: _e,
      labels(E) {
        b = E, z();
      },
      walls(E) {
        m = E, o?.updateWalls(E), z();
      },
      symbols(E) {
        y = E, r?.symbols(E), z();
      }
    };
  } catch (M) {
    throw ie(), M;
  }
}
export {
  mi as createThreeRuntime
};
