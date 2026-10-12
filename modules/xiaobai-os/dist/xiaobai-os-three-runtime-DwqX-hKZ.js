/* eslint-disable */
import { C as Ut, D as zt, S as jt, _ as Gt, a as Ht, b as Bt, c as gt, d as Kt, f as Je, g as Vt, h as bt, i as Fe, l as Xt, m as Yt, n as Wt, o as ve, p as de, r as Zt, s as qt, u as $t, v as Qt, x as Jt, y as es } from "./xiaobai-os-MapBrowser-wEeT2tGo.js";
import { $ as ee, A as ts, At as Ue, B as Le, C as be, D as ss, Dt as ns, E as os, Et as is, F as yt, G as Te, H as as, I as rs, It as B, J as Re, K as ye, L as cs, Lt as E, M as ls, Mt as ie, N as wt, Nt as et, O as ne, Ot as hs, P as ds, Pt as us, Q as fs, R as ps, Rt as tt, St as _t, T as Tt, U as re, V as Be, W as ms, X as K, Y as Z, Z as ge, _ as ze, _t as gs, a as ae, at as st, b as xt, c as Se, ct as bs, d as se, dt as ys, et as Ae, f as nt, ft as ws, g as Ke, gt as Ve, h as Xe, ht as ot, i as _s, it as Ts, j as xs, jt as Ms, k as Ss, kt as Ye, l as Es, lt as vs, m as Rs, mt as xe, n as As, nt as Ls, o as Mt, ot as We, p as St, pt as Ps, q as Oe, r as Os, rt as Ns, s as Ne, st as Et, t as ks, tt as Cs, u as Is, ut as Ze, v as Ds, w as Fs, wt as Us, x as Me, xt as ce, y as zs, yt as qe, z as js } from "./xiaobai-os-three.module-Ah3xIFOr.js";
import { t as it } from "./xiaobai-os-RoundedBoxGeometry-6yGznEQp.js";
import { n as at, t as Gs } from "./xiaobai-os-BufferGeometryUtils-BLglYbHr.js";
var rt = { type: "change" }, $e = { type: "start" }, vt = { type: "end" }, Ee = new gs(), ct = new vs(), Hs = Math.cos(70 * Re.DEG2RAD), V = new E(), Y = 2 * Math.PI, F = {
  NONE: -1,
  ROTATE: 0,
  DOLLY: 1,
  PAN: 2,
  TOUCH_ROTATE: 3,
  TOUCH_PAN: 4,
  TOUCH_DOLLY_PAN: 5,
  TOUCH_DOLLY_ROTATE: 6
}, ke = 1e-6, Bs = class extends Rs {
  constructor(e, t = null) {
    super(e, t), this.state = F.NONE, this.target = new E(), this.cursor = new E(), this.minDistance = 0, this.maxDistance = 1 / 0, this.minZoom = 0, this.maxZoom = 1 / 0, this.minTargetRadius = 0, this.maxTargetRadius = 1 / 0, this.minPolarAngle = 0, this.maxPolarAngle = Math.PI, this.minAzimuthAngle = -1 / 0, this.maxAzimuthAngle = 1 / 0, this.enableDamping = !1, this.dampingFactor = 0.05, this.enableZoom = !0, this.zoomSpeed = 1, this.enableRotate = !0, this.rotateSpeed = 1, this.keyRotateSpeed = 1, this.enablePan = !0, this.panSpeed = 1, this.screenSpacePanning = !0, this.keyPanSpeed = 7, this.zoomToCursor = !1, this.autoRotate = !1, this.autoRotateSpeed = 2, this.keys = {
      LEFT: "ArrowLeft",
      UP: "ArrowUp",
      RIGHT: "ArrowRight",
      BOTTOM: "ArrowDown"
    }, this.mouseButtons = {
      LEFT: ye.ROTATE,
      MIDDLE: ye.DOLLY,
      RIGHT: ye.PAN
    }, this.touches = {
      ONE: ie.ROTATE,
      TWO: ie.DOLLY_PAN
    }, this.target0 = this.target.clone(), this.position0 = this.object.position.clone(), this.zoom0 = this.object.zoom, this._domElementKeyEvents = null, this._lastPosition = new E(), this._lastQuaternion = new xe(), this._lastTargetPosition = new E(), this._quat = new xe().setFromUnitVectors(e.up, new E(0, 1, 0)), this._quatInverse = this._quat.clone().invert(), this._spherical = new Ue(), this._sphericalDelta = new Ue(), this._scale = 1, this._panOffset = new E(), this._rotateStart = new B(), this._rotateEnd = new B(), this._rotateDelta = new B(), this._panStart = new B(), this._panEnd = new B(), this._panDelta = new B(), this._dollyStart = new B(), this._dollyEnd = new B(), this._dollyDelta = new B(), this._dollyDirection = new E(), this._mouse = new B(), this._performCursorZoom = !1, this._pointers = [], this._pointerPositions = {}, this._controlActive = !1, this._onPointerMove = Vs.bind(this), this._onPointerDown = Ks.bind(this), this._onPointerUp = Xs.bind(this), this._onContextMenu = Js.bind(this), this._onMouseWheel = Zs.bind(this), this._onKeyDown = qs.bind(this), this._onTouchStart = $s.bind(this), this._onTouchMove = Qs.bind(this), this._onMouseDown = Ys.bind(this), this._onMouseMove = Ws.bind(this), this._interceptControlDown = en.bind(this), this._interceptControlUp = tn.bind(this), this.domElement !== null && this.connect(this.domElement), this.update();
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
    this.target.copy(this.target0), this.object.position.copy(this.position0), this.object.zoom = this.zoom0, this.object.updateProjectionMatrix(), this.dispatchEvent(rt), this.update(), this.state = F.NONE;
  }
  update(e = null) {
    const t = this.object.position;
    V.copy(t).sub(this.target), V.applyQuaternion(this._quat), this._spherical.setFromVector3(V), this.autoRotate && this.state === F.NONE && this._rotateLeft(this._getAutoRotationAngle(e)), this.enableDamping ? (this._spherical.theta += this._sphericalDelta.theta * this.dampingFactor, this._spherical.phi += this._sphericalDelta.phi * this.dampingFactor) : (this._spherical.theta += this._sphericalDelta.theta, this._spherical.phi += this._sphericalDelta.phi);
    let n = this.minAzimuthAngle, s = this.maxAzimuthAngle;
    isFinite(n) && isFinite(s) && (n < -Math.PI ? n += Y : n > Math.PI && (n -= Y), s < -Math.PI ? s += Y : s > Math.PI && (s -= Y), n <= s ? this._spherical.theta = Math.max(n, Math.min(s, this._spherical.theta)) : this._spherical.theta = this._spherical.theta > (n + s) / 2 ? Math.max(n, this._spherical.theta) : Math.min(s, this._spherical.theta)), this._spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this._spherical.phi)), this._spherical.makeSafe(), this.enableDamping === !0 ? this.target.addScaledVector(this._panOffset, this.dampingFactor) : this.target.add(this._panOffset), this.target.sub(this.cursor), this.target.clampLength(this.minTargetRadius, this.maxTargetRadius), this.target.add(this.cursor);
    let i = !1;
    if (this.zoomToCursor && this._performCursorZoom || this.object.isOrthographicCamera) this._spherical.radius = this._clampDistance(this._spherical.radius);
    else {
      const o = this._spherical.radius;
      this._spherical.radius = this._clampDistance(this._spherical.radius * this._scale), i = o != this._spherical.radius;
    }
    if (V.setFromSpherical(this._spherical), V.applyQuaternion(this._quatInverse), t.copy(this.target).add(V), this.object.lookAt(this.target), this.enableDamping === !0 ? (this._sphericalDelta.theta *= 1 - this.dampingFactor, this._sphericalDelta.phi *= 1 - this.dampingFactor, this._panOffset.multiplyScalar(1 - this.dampingFactor)) : (this._sphericalDelta.set(0, 0, 0), this._panOffset.set(0, 0, 0)), this.zoomToCursor && this._performCursorZoom) {
      let o = null;
      if (this.object.isPerspectiveCamera) {
        const a = V.length();
        o = this._clampDistance(a * this._scale);
        const r = a - o;
        this.object.position.addScaledVector(this._dollyDirection, r), this.object.updateMatrixWorld(), i = !!r;
      } else if (this.object.isOrthographicCamera) {
        const a = new E(this._mouse.x, this._mouse.y, 0);
        a.unproject(this.object);
        const r = this.object.zoom;
        this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), this.object.updateProjectionMatrix(), i = r !== this.object.zoom;
        const c = new E(this._mouse.x, this._mouse.y, 0);
        c.unproject(this.object), this.object.position.sub(c).add(a), this.object.updateMatrixWorld(), o = V.length();
      } else
        console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."), this.zoomToCursor = !1;
      o !== null && (this.screenSpacePanning ? this.target.set(0, 0, -1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position) : (Ee.origin.copy(this.object.position), Ee.direction.set(0, 0, -1).transformDirection(this.object.matrix), Math.abs(this.object.up.dot(Ee.direction)) < Hs ? this.object.lookAt(this.target) : (ct.setFromNormalAndCoplanarPoint(this.object.up, this.target), Ee.intersectPlane(ct, this.target))));
    } else if (this.object.isOrthographicCamera) {
      const o = this.object.zoom;
      this.object.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.object.zoom / this._scale)), o !== this.object.zoom && (this.object.updateProjectionMatrix(), i = !0);
    }
    return this._scale = 1, this._performCursorZoom = !1, i || this._lastPosition.distanceToSquared(this.object.position) > ke || 8 * (1 - this._lastQuaternion.dot(this.object.quaternion)) > ke || this._lastTargetPosition.distanceToSquared(this.target) > ke ? (this.dispatchEvent(rt), this._lastPosition.copy(this.object.position), this._lastQuaternion.copy(this.object.quaternion), this._lastTargetPosition.copy(this.target), !0) : !1;
  }
  _getAutoRotationAngle(e) {
    return e !== null ? Y / 60 * this.autoRotateSpeed * e : Y / 60 / 60 * this.autoRotateSpeed;
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
    V.setFromMatrixColumn(t, 0), V.multiplyScalar(-e), this._panOffset.add(V);
  }
  _panUp(e, t) {
    this.screenSpacePanning === !0 ? V.setFromMatrixColumn(t, 1) : (V.setFromMatrixColumn(t, 0), V.crossVectors(this.object.up, V)), V.multiplyScalar(e), this._panOffset.add(V);
  }
  _pan(e, t) {
    const n = this.domElement;
    if (this.object.isPerspectiveCamera) {
      const s = this.object.position;
      V.copy(s).sub(this.target);
      let i = V.length();
      i *= Math.tan(this.object.fov / 2 * Math.PI / 180), this._panLeft(2 * e * i / n.clientHeight, this.object.matrix), this._panUp(2 * t * i / n.clientHeight, this.object.matrix);
    } else this.object.isOrthographicCamera ? (this._panLeft(e * (this.object.right - this.object.left) / this.object.zoom / n.clientWidth, this.object.matrix), this._panUp(t * (this.object.top - this.object.bottom) / this.object.zoom / n.clientHeight, this.object.matrix)) : (console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."), this.enablePan = !1);
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
    const n = this.domElement.getBoundingClientRect(), s = e - n.left, i = t - n.top, o = n.width, a = n.height;
    this._mouse.x = s / o * 2 - 1, this._mouse.y = -(i / a) * 2 + 1, this._dollyDirection.set(this._mouse.x, this._mouse.y, 1).unproject(this.object).sub(this.object.position).normalize();
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
    this._rotateLeft(Y * this._rotateDelta.x / t.clientHeight), this._rotateUp(Y * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd), this.update();
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
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, this.keyPanSpeed), t = !0;
        break;
      case this.keys.BOTTOM:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateUp(-Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(0, -this.keyPanSpeed), t = !0;
        break;
      case this.keys.LEFT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(this.keyPanSpeed, 0), t = !0;
        break;
      case this.keys.RIGHT:
        e.ctrlKey || e.metaKey || e.shiftKey ? this.enableRotate && this._rotateLeft(-Y * this.keyRotateSpeed / this.domElement.clientHeight) : this.enablePan && this._pan(-this.keyPanSpeed, 0), t = !0;
        break;
    }
    t && (e.preventDefault(), this.update());
  }
  _handleTouchStartRotate(e) {
    if (this._pointers.length === 1) this._rotateStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._rotateStart.set(n, s);
    }
  }
  _handleTouchStartPan(e) {
    if (this._pointers.length === 1) this._panStart.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._panStart.set(n, s);
    }
  }
  _handleTouchStartDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, s = e.pageY - t.y, i = Math.sqrt(n * n + s * s);
    this._dollyStart.set(0, i);
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
      const n = this._getSecondPointerPosition(e), s = 0.5 * (e.pageX + n.x), i = 0.5 * (e.pageY + n.y);
      this._rotateEnd.set(s, i);
    }
    this._rotateDelta.subVectors(this._rotateEnd, this._rotateStart).multiplyScalar(this.rotateSpeed);
    const t = this.domElement;
    this._rotateLeft(Y * this._rotateDelta.x / t.clientHeight), this._rotateUp(Y * this._rotateDelta.y / t.clientHeight), this._rotateStart.copy(this._rotateEnd);
  }
  _handleTouchMovePan(e) {
    if (this._pointers.length === 1) this._panEnd.set(e.pageX, e.pageY);
    else {
      const t = this._getSecondPointerPosition(e), n = 0.5 * (e.pageX + t.x), s = 0.5 * (e.pageY + t.y);
      this._panEnd.set(n, s);
    }
    this._panDelta.subVectors(this._panEnd, this._panStart).multiplyScalar(this.panSpeed), this._pan(this._panDelta.x, this._panDelta.y), this._panStart.copy(this._panEnd);
  }
  _handleTouchMoveDolly(e) {
    const t = this._getSecondPointerPosition(e), n = e.pageX - t.x, s = e.pageY - t.y, i = Math.sqrt(n * n + s * s);
    this._dollyEnd.set(0, i), this._dollyDelta.set(0, Math.pow(this._dollyEnd.y / this._dollyStart.y, this.zoomSpeed)), this._dollyOut(this._dollyDelta.y), this._dollyStart.copy(this._dollyEnd);
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
    t === void 0 && (t = new B(), this._pointerPositions[e.pointerId] = t), t.set(e.pageX, e.pageY);
  }
  _getSecondPointerPosition(e) {
    const t = e.pointerId === this._pointers[0] ? this._pointers[1] : this._pointers[0];
    return this._pointerPositions[t];
  }
  _customWheelEvent(e) {
    const t = e.deltaMode, n = {
      clientX: e.clientX,
      clientY: e.clientY,
      deltaY: e.deltaY
    };
    switch (t) {
      case 1:
        n.deltaY *= 16;
        break;
      case 2:
        n.deltaY *= 100;
        break;
    }
    return e.ctrlKey && !this._controlActive && (n.deltaY *= 10), n;
  }
};
function Ks(e) {
  this.enabled !== !1 && (this._pointers.length === 0 && (this.domElement.setPointerCapture(e.pointerId), this.domElement.addEventListener("pointermove", this._onPointerMove), this.domElement.addEventListener("pointerup", this._onPointerUp)), !this._isTrackingPointer(e) && (this._addPointer(e), e.pointerType === "touch" ? this._onTouchStart(e) : this._onMouseDown(e)));
}
function Vs(e) {
  this.enabled !== !1 && (e.pointerType === "touch" ? this._onTouchMove(e) : this._onMouseMove(e));
}
function Xs(e) {
  switch (this._removePointer(e), this._pointers.length) {
    case 0:
      this.domElement.releasePointerCapture(e.pointerId), this.domElement.removeEventListener("pointermove", this._onPointerMove), this.domElement.removeEventListener("pointerup", this._onPointerUp), this.dispatchEvent(vt), this.state = F.NONE;
      break;
    case 1:
      const t = this._pointers[0], n = this._pointerPositions[t];
      this._onTouchStart({
        pointerId: t,
        pageX: n.x,
        pageY: n.y
      });
      break;
  }
}
function Ys(e) {
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
    case ye.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseDownDolly(e), this.state = F.DOLLY;
      break;
    case ye.ROTATE:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = F.PAN;
      } else {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = F.ROTATE;
      }
      break;
    case ye.PAN:
      if (e.ctrlKey || e.metaKey || e.shiftKey) {
        if (this.enableRotate === !1) return;
        this._handleMouseDownRotate(e), this.state = F.ROTATE;
      } else {
        if (this.enablePan === !1) return;
        this._handleMouseDownPan(e), this.state = F.PAN;
      }
      break;
    default:
      this.state = F.NONE;
  }
  this.state !== F.NONE && this.dispatchEvent($e);
}
function Ws(e) {
  switch (this.state) {
    case F.ROTATE:
      if (this.enableRotate === !1) return;
      this._handleMouseMoveRotate(e);
      break;
    case F.DOLLY:
      if (this.enableZoom === !1) return;
      this._handleMouseMoveDolly(e);
      break;
    case F.PAN:
      if (this.enablePan === !1) return;
      this._handleMouseMovePan(e);
      break;
  }
}
function Zs(e) {
  this.enabled === !1 || this.enableZoom === !1 || this.state !== F.NONE || (e.preventDefault(), this.dispatchEvent($e), this._handleMouseWheel(this._customWheelEvent(e)), this.dispatchEvent(vt));
}
function qs(e) {
  this.enabled !== !1 && this._handleKeyDown(e);
}
function $s(e) {
  switch (this._trackPointer(e), this._pointers.length) {
    case 1:
      switch (this.touches.ONE) {
        case ie.ROTATE:
          if (this.enableRotate === !1) return;
          this._handleTouchStartRotate(e), this.state = F.TOUCH_ROTATE;
          break;
        case ie.PAN:
          if (this.enablePan === !1) return;
          this._handleTouchStartPan(e), this.state = F.TOUCH_PAN;
          break;
        default:
          this.state = F.NONE;
      }
      break;
    case 2:
      switch (this.touches.TWO) {
        case ie.DOLLY_PAN:
          if (this.enableZoom === !1 && this.enablePan === !1) return;
          this._handleTouchStartDollyPan(e), this.state = F.TOUCH_DOLLY_PAN;
          break;
        case ie.DOLLY_ROTATE:
          if (this.enableZoom === !1 && this.enableRotate === !1) return;
          this._handleTouchStartDollyRotate(e), this.state = F.TOUCH_DOLLY_ROTATE;
          break;
        default:
          this.state = F.NONE;
      }
      break;
    default:
      this.state = F.NONE;
  }
  this.state !== F.NONE && this.dispatchEvent($e);
}
function Qs(e) {
  switch (this._trackPointer(e), this.state) {
    case F.TOUCH_ROTATE:
      if (this.enableRotate === !1) return;
      this._handleTouchMoveRotate(e), this.update();
      break;
    case F.TOUCH_PAN:
      if (this.enablePan === !1) return;
      this._handleTouchMovePan(e), this.update();
      break;
    case F.TOUCH_DOLLY_PAN:
      if (this.enableZoom === !1 && this.enablePan === !1) return;
      this._handleTouchMoveDollyPan(e), this.update();
      break;
    case F.TOUCH_DOLLY_ROTATE:
      if (this.enableZoom === !1 && this.enableRotate === !1) return;
      this._handleTouchMoveDollyRotate(e), this.update();
      break;
    default:
      this.state = F.NONE;
  }
}
function Js(e) {
  this.enabled !== !1 && e.preventDefault();
}
function en(e) {
  e.key === "Control" && (this._controlActive = !0, this.domElement.getRootNode().addEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
function tn(e) {
  e.key === "Control" && (this._controlActive = !1, this.domElement.getRootNode().removeEventListener("keyup", this._interceptControlUp, {
    passive: !0,
    capture: !0
  }));
}
var lt = {
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
function sn(e) {
  if (de(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(lt, e.icon)) return;
  const t = e.icon;
  return lt[t].includes(e.shape) ? t : void 0;
}
function nn(e) {
  const [t, n, s, i] = e.viewBox, o = Qt(s, i);
  return {
    scale: o,
    point: (a, r, c = 0) => new E((a - t - s / 2) / o, c, (r - n - i / 2) / o)
  };
}
function on(e, t) {
  const n = bt(e), s = [n.x + n.width / 2, n.y + n.height / 2], i = Gt(e), o = i.points.map(([a, r]) => new B((a - s[0]) / t, (r - s[1]) / t));
  return i.closed && o.length > 1 && o[0].equals(o[o.length - 1]) && o.pop(), {
    center: s,
    width: n.width / t,
    depth: n.height / t,
    points: o,
    closed: i.closed,
    rotation: -(e.rotation || 0) * Math.PI / 180
  };
}
function an(e, t) {
  const n = new zs(new Us(e.map((s) => new B(s.x, -s.y))), {
    depth: t,
    bevelEnabled: !1,
    steps: 1,
    curveSegments: 1
  });
  return n.rotateX(-Math.PI / 2), n;
}
function rn(e, t, n) {
  const s = e.map((i) => new E(i.x, n, i.y));
  return t && s.length && s.push(s[0].clone()), new Se().setFromPoints(s);
}
function cn(e, t, n) {
  const s = [];
  for (let o = 0; o < e.length - (t ? 0 : 1); o += 1) {
    const a = e[o], r = e[(o + 1) % e.length], c = r.clone().sub(a);
    if (!c.lengthSq()) continue;
    const h = new B(-c.y, c.x).normalize().multiplyScalar(n / 2), l = [
      a.clone().add(h),
      a.clone().sub(h),
      r.clone().add(h),
      r.clone().sub(h)
    ];
    for (const d of [
      0,
      2,
      1,
      1,
      2,
      3
    ]) s.push(l[d].x, 0, l[d].y);
  }
  const i = new Se();
  return i.setAttribute("position", new Me(s, 3)), i.computeVertexNormals(), i;
}
function Rt(e, t) {
  return e.slice(0, t ? e.length : -1).flatMap((n, s) => {
    const i = e[(s + 1) % e.length], o = n.distanceTo(i);
    return o ? [{
      x: (n.x + i.x) / 2,
      z: (n.y + i.y) / 2,
      length: o,
      rotation: -Math.atan2(i.y - n.y, i.x - n.x)
    }] : [];
  });
}
function pe(e, t, n) {
  const s = e / 128 * n, i = t / 128 * n, o = Math.floor(s), a = Math.floor(i), r = (d) => d * d * (3 - 2 * d), c = (d, u) => {
    let p = Math.imul(d % n + 17, 374761393) + Math.imul(u % n + 41, 668265263);
    return p = Math.imul(p ^ p >>> 13, 1274126177), ((p ^ p >>> 16) >>> 0) / 4294967296;
  }, h = r(s - o), l = r(i - a);
  return (c(o, a) * (1 - h) + c(o + 1, a) * h) * (1 - l) + (c(o, a + 1) * (1 - h) + c(o + 1, a + 1) * h) * l;
}
function ln(e, t) {
  const s = new Uint8Array(65536);
  let i = 781;
  for (let a = 0; a < 128; a += 1) for (let r = 0; r < 128; r += 1) {
    i = Math.imul(i, 1664525) + 1013904223 >>> 0;
    const c = i / 4294967296;
    let h = 0.94 + c * 0.06;
    if (e === "wood") {
      if (h = 0.94 + Math.sin(a * 0.32 + Math.sin(r * Math.PI / 64) * 0.8 + Math.sin(a * 0.14)) * 0.014 + c * 0.012, t) {
        const d = Math.floor(a / 32);
        h += [
          0,
          0.018,
          -0.015,
          0.01
        ][d], (a % 32 === 0 || (r + d * 47) % 128 === 0) && (h = 0.83);
      }
    } else e === "tile" ? h = r % 64 < 2 || a % 64 < 2 ? 0.73 : 0.96 + c * 0.04 : [
      "fabric",
      "carpet",
      "bed-sheet",
      "tatami"
    ].includes(e) ? h = 0.95 + (r % 4 < 2 == a % 4 < 2 ? 0.012 : 0) + c * 0.018 : e === "stone" || e === "marble" ? h = 0.86 + pe(r, a, 4) * 0.085 + pe(r, a, 16) * 0.035 + c * 0.02 : [
      "grass",
      "forest",
      "dirt",
      "sand",
      "snow"
    ].includes(e) ? h = 0.91 + pe(r, a, 4) * 0.04 + pe(r, a, 16) * 0.025 + c * 0.015 : [
      "water",
      "slime",
      "blood",
      "flesh"
    ].includes(e) ? h = 0.92 + (pe(r, a, 4) * 0.6 + pe(r, a, 8) * 0.4) * (e === "flesh" ? 0.06 : 0.035) + c * 8e-3 : e === "metal" && (h = 0.97 + Math.sin(a * 2) * 8e-3 + c * 0.012);
    const l = Math.round(h * 255);
    s.set([
      l,
      l,
      l,
      255
    ], (a * 128 + r) * 4);
  }
  const o = new Ke(s, 128, 128, Ve);
  return o.colorSpace = ce, o.wrapS = o.wrapT = qe, t && e === "wood" && o.repeat.set(0.28, 0.28), o.magFilter = Le, o.minFilter = Be, o.generateMipmaps = !0, o.anisotropy = 4, o.needsUpdate = !0, o;
}
function hn(e, t) {
  const n = Jt(e), s = Bt[e];
  function i(o, a) {
    const r = a ? o : new Uint8Array(n.size * n.size * 4);
    if (!a) for (let h = 0; h < o.length; h++) r.set([
      o[h],
      o[h],
      o[h],
      255
    ], h * 4);
    const c = t.own(new Ke(r, n.size, n.size, Ve));
    return a && (c.colorSpace = ce), c.wrapS = c.wrapT = qe, c.repeat.setScalar(1 / s.size), c.magFilter = Le, c.minFilter = Be, c.generateMipmaps = !0, c.anisotropy = 4, c.needsUpdate = !0, c;
  }
  return {
    map: i(n.color, !0),
    bumpMap: i(n.height, !1),
    roughnessMap: i(n.roughness, !1),
    bumpScale: s.relief
  };
}
var dn = {
  ...Ut,
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
function un(e, t, n) {
  const s = Fe(n), i = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map();
  function c(d, u = 0, p = !1) {
    const g = d.material || (d.category === "water" ? "water" : "unknown"), f = p && jt(g) ? g : void 0, M = `${g}:${d.category}:${d.certainty}:${u}:${!!f}`;
    let T = i.get(M);
    if (!T) {
      const b = {
        danger: "#d77c80",
        magic: "#b29cdb",
        light: "#f4d697",
        actor: "#4598cf",
        marker: "#72b9cb",
        secret: "#8d9ca9"
      }, m = d.category === "terrain", y = g === "wood" && m ? "#b69a77" : dn[g], _ = new se(f ? "#ffffff" : !d.material && d.category in b ? b[d.category] : y);
      _.lerp(new se(u > 0 ? "#ffffff" : "#201c1a"), Math.abs(u));
      const x = ve(d, "").opacity * (g === "glass" ? 0.42 : g === "slime" ? 0.88 : 1), w = !f && ![
        "unknown",
        "glass",
        "rune",
        "warm-light",
        "cold-light",
        "shadow"
      ].includes(g), O = `${g}:${m}`;
      w && !a.has(O) && a.set(O, e.own(ln(g, m)));
      const k = w ? a.get(O) : null;
      f && !r.has(f) && r.set(f, hn(f, e));
      const D = f ? r.get(f) : void 0, H = [
        "water",
        "slime",
        "flesh",
        "blood",
        "glass"
      ].includes(g);
      T = e.own(new ee({
        color: _,
        roughness: g === "metal" ? 0.35 : H ? 0.26 : g === "wood" ? 0.63 : 0.86,
        metalness: g === "metal" ? 0.65 : 0,
        transparent: x < 1,
        opacity: x,
        clearcoat: H ? 0.65 : 0,
        clearcoatRoughness: 0.23,
        dithering: !0,
        depthWrite: x >= 1,
        side: 2,
        map: k,
        bumpMap: k,
        bumpScale: g === "stone" || g === "dirt" ? 0.055 : H ? 0.018 : 0.014,
        emissive: [
          "rune",
          "warm-light",
          "cold-light"
        ].includes(g) ? _ : "#000000",
        emissiveIntensity: g === "warm-light" || g === "cold-light" ? s.lampEmission : 0.18,
        ...D && {
          ...D,
          roughness: 1
        }
      })), i.set(M, T);
    }
    return T;
  }
  function h(d) {
    const u = `${d.certainty}:${d.category}`;
    let p = o.get(u);
    if (!p) {
      const g = d.certainty && d.certainty !== "confirmed";
      p = e.own(new cs({
        color: t ? "#91a4b2" : "#596d78",
        dashSize: d.certainty === "unknown" ? 0.035 : 0.12,
        gapSize: g ? 0.09 : 0,
        transparent: !0,
        opacity: ve(d, "").opacity * (g ? 0.7 : 0.28)
      })), o.set(u, p);
    }
    return p;
  }
  function l(d, u = 0) {
    const p = n?.artificial === "on" ? d.material === "cold-light" ? "cold-light" : "warm-light" : "bed-sheet";
    return c({
      ...d,
      material: p
    }, u);
  }
  return {
    mesh: c,
    ground: (d) => c(d, 0, !0),
    line: h,
    lampShade: l
  };
}
var At = class {
  resources = /* @__PURE__ */ new Set();
  own(e) {
    return this.resources.add(e), e;
  }
  dispose() {
    for (const e of this.resources) e.dispose();
    this.resources.clear();
  }
};
function fn(e, t, n, s) {
  const { cylinder: i, ring: o, cone: a } = s;
  switch (e) {
    case "column": {
      const r = t.shape === "circle" ? i : void 0;
      return n(0, 0.08, 0, 1, 0.16, 1, -0.12, r), n(0, 0.91, 0, 0.68, 1.5, 0.68, 0.02, r), n(0, 1.7, 0, 0.9, 0.12, 0.9, 0.12, r), 1.76;
    }
    case "partition":
      for (const r of [-0.4, 0.4])
        n(r, 0.055, 0, 0.15, 0.11, 1, -0.18), n(r, 0.79, 0, 0.07, 1.5, 0.15, -0.15);
      return n(0, 0.83, 0, 0.78, 1.27, 0.09, 0.08), n(0, 1.5, 0, 0.88, 0.06, 0.15, 0.14), 1.54;
    case "ladder":
      for (const r of [-0.36, 0.36]) n(r, 0.9, 0, 0.09, 1.8, 0.2, -0.1);
      for (let r = 0; r < 6; r++) n(0, 0.18 + r * 0.29, 0, 0.7, 0.055, 0.16, 0.13);
      return 1.8;
    case "well":
      return n(0, 0.21, 0, 0.94, 0.42, 0.94, -0.08, o, t.material || "stone"), n(0, 0.44, 0, 1, 0.08, 1, 0.12, o, t.material || "stone"), 0.48;
    case "fountain":
      return n(0, 0.03, 0, 0.92, 0.06, 0.92, -0.2, i, t.material || "stone"), n(0, 0.13, 0, 1, 0.2, 1, 0.1, o, t.material || "stone"), n(0, 0.38, 0, 0.18, 0.7, 0.18, -0.06, i, t.material || "stone"), n(0, 0.72, 0, 0.48, 0.1, 0.48, 0.12, o, t.material || "stone"), n(0, 0.85, 0, 0.08, 0.17, 0.08, -0.12, i, t.material || "stone"), 0.935;
    case "fire":
      return n(0, 0.055, 0, 0.85, 0.11, 0.17, -0.28, void 0, "wood"), n(0, 0.11, 0, 0.17, 0.11, 0.85, -0.15, void 0, "wood"), n(0, 0.43, 0, 0.6, 0.62, 0.6, 0, a, "warm-light"), n(0.1, 0.31, 0.12, 0.32, 0.4, 0.32, 0.35, a, "warm-light"), 0.74;
    case "flag":
      return n(-0.37, 0.035, 0, 0.25, 0.07, 0.7, -0.22), n(-0.37, 0.8, 0, 0.045, 1.6, 0.08, -0.15), n(0.04, 1.28, 0, 0.77, 0.46, 0.035, 0.1, void 0, t.material || "fabric"), 1.6;
    case "sign":
      for (const r of [-0.3, 0.3])
        n(r, 0.055, 0, 0.18, 0.11, 0.85, -0.22), n(r, 0.62, 0, 0.07, 1.2, 0.16, -0.12);
      return n(0, 0.9, 0, 1, 0.64, 0.18, -0.05), n(0, 0.9, 0.095, 0.9, 0.52, 0.025, 0.22), 1.22;
    case "terminal":
      return n(0, 0.065, 0, 0.72, 0.13, 0.84, -0.25), n(0, 0.54, -0.09, 0.4, 1, 0.44, -0.1), n(0, 1.1, -0.12, 1, 0.7, 0.3, -0.16), n(0, 1.11, 0.04, 0.86, 0.54, 0.025, -0.6), n(0, 0.77, 0.21, 0.88, 0.06, 0.55, 0.12), 1.45;
    case "machine":
      n(0, 0.055, 0, 1, 0.11, 1, -0.25), n(-0.16, 0.39, 0, 0.62, 0.64, 0.82, 0), n(-0.16, 0.79, 0, 0.54, 0.22, 0.72, 0.15), n(0.34, 0.46, 0, 0.26, 0.76, 0.73, -0.14);
      for (const r of [
        -0.34,
        -0.2,
        -0.06,
        0.08
      ]) n(r, 0.5, 0.421, 0.04, 0.3, 0.014, -0.5);
      return 0.9;
    case "vending-machine":
      return n(0, 0.1, 0, 0.94, 0.2, 0.86, -0.25), n(0, 0.92, 0, 1, 1.68, 0.92, -0.02), n(-0.12, 1.11, 0.468, 0.64, 1.05, 0.018, -0.5), n(0.34, 1.05, 0.48, 0.17, 0.38, 0.03, -0.18), n(0, 0.31, 0.468, 0.74, 0.18, 0.018, -0.65), n(0, 1.73, 0, 1, 0.07, 0.98, 0.16), 1.765;
  }
}
function pn(e, t) {
  const n = e.own(new it(1, 1, 1, 3, 0.035)), s = e.own(new it(1, 1, 1, 4, 0.16)), i = e.own(n.clone()), o = i.getAttribute("position");
  for (let d = 0; d < o.count; d += 1) {
    const u = 0.72 + 0.28 * (o.getY(d) + 0.5);
    o.setX(d, o.getX(d) * u), o.setZ(d, o.getZ(d) * u);
  }
  i.computeVertexNormals();
  const a = e.own(new Xe(0.5, 0.5, 1, 32)), r = e.own(new Ye(0.5, 16, 10)), c = e.own(new Ds(0.5, 0)), h = e.own(new St(0.5, 1, 9)), l = e.own(new ds([
    [0.35, -0.5],
    [0.5, -0.5],
    [0.5, 0.5],
    [0.35, 0.5],
    [0.35, -0.5]
  ].map(([d, u]) => new B(d, u)), 32));
  return function(u, p, g, f, M) {
    const T = Math.min(1.6, Math.min(f, M)), b = /* @__PURE__ */ new Map();
    function m(w, O, k, D, H, A, R = 0, S = n, U) {
      const j = t.mesh(U ? {
        ...p,
        material: U
      } : p, R), P = `${S.uuid}:${j.uuid}`;
      b.has(P) || b.set(P, {
        geometry: S,
        material: j,
        matrices: []
      }), b.get(P).matrices.push(new Z().makeScale(D * f, H * T, A * M).setPosition(w * f, O * T, k * M));
    }
    function y(w) {
      for (const O of [-0.37, 0.37]) for (const k of [-0.36, 0.36]) m(O, w / 2, k, 0.075, w, 0.075, -0.16, i);
    }
    function _() {
      switch (g) {
        case "table":
          if (p.shape === "circle")
            m(0, 0.6, 0, 1, 0.08, 1, 0.12, a), m(0, 0.29, 0, 0.18, 0.58, 0.18, -0.15, a), m(0, 0.04, 0, 0.43, 0.08, 0.43, -0.22, a);
          else {
            y(0.58);
            for (const w of [-0.36, 0.36]) m(0, 0.52, w, 0.83, 0.13, 0.045, -0.12);
            for (const w of [-0.37, 0.37]) m(w, 0.52, 0, 0.045, 0.13, 0.75, -0.12);
            m(0, 0.607, 0, 0.98, 0.065, 0.98, -0.1), m(0, 0.651, 0, 1, 0.035, 1, 0.12);
          }
          return 0.67 * T;
        case "chair":
          y(0.52), m(0, 0.55, 0.035, 1, 0.08, 0.93, 0.06), m(0, 0.595, 0.05, 0.91, 0.035, 0.83, 0.16);
          for (const w of [-0.42, 0.42]) m(w, 0.82, -0.425, 0.095, 0.73, 0.12, -0.1);
          for (const w of [
            -0.22,
            0,
            0.22
          ]) m(w, 0.9, -0.425, 0.12, 0.42, 0.07, 0.02);
          m(0, 1.14, -0.425, 0.96, 0.1, 0.14, 0.12);
          for (const w of [-0.37, 0.37]) m(w, 0.23, 0, 0.035, 0.045, 0.74, -0.12);
          return 1.19 * T;
        case "bed":
          return y(0.2), m(0, 0.24, 0, 1, 0.18, 1, -0.2), m(0, 0.39, 0.02, 0.96, 0.16, 0.92, 0.55), m(0, 0.5, 0.15, 0.98, 0.06, 0.63, 0.08), m(0, 0.5, -0.29, 0.64, 0.13, 0.22, 0.65), m(0, 0.47, -0.47, 1, 0.7, 0.06, -0.16), 0.82 * T;
        case "counter":
          m(0, 0.08, 0, 0.9, 0.16, 0.86, -0.28), m(0, 0.57, 0, 0.94, 0.9, 0.91, -0.08), m(0, 0.17, 0.46, 0.96, 0.1, 0.06, 0.06), m(0, 0.94, 0.46, 0.96, 0.08, 0.06, 0.08);
          for (const w of [
            -0.32,
            0,
            0.32
          ])
            m(w, 0.55, 0.46, 0.28, 0.66, 0.045, 0.03), m(w, 0.55, 0.487, 0.235, 0.52, 0.02, -0.09);
          return m(0, 1.025, 0, 1, 0.065, 1, -0.18), m(0, 1.065, 0, 1, 0.03, 1, 0.16), 1.08 * T;
        case "shelf":
          m(0, 1.05, -0.47, 1, 2.1, 0.06, -0.2);
          for (const w of [-0.48, 0.48]) m(w, 1.05, 0, 0.04, 2.1, 1, -0.08);
          for (let w = 0; w < 4; w += 1) m(0, 0.04 + w * 0.67, 0, 1, 0.06, 1, 0.12);
          for (const w of [-0.17, 0.17]) m(w, 1.03, 0, 0.025, 1.98, 0.92, -0.04);
          return m(0, 2.06, 0, 1, 0.08, 1, 0.16), 2.1 * T;
        case "sofa":
          y(0.14), m(0, 0.26, 0, 0.96, 0.27, 0.96, -0.18), m(0, 0.65, -0.37, 0.98, 0.76, 0.26, -0.08, s);
          for (const w of [-0.44, 0.44]) m(w, 0.52, 0, 0.12, 0.49, 0.98, 0.02, s);
          for (const w of [
            -0.26,
            0,
            0.26
          ])
            m(w, 0.46, 0.11, 0.245, 0.19, 0.72, 0.12, s), m(w, 0.77, -0.22, 0.245, 0.43, 0.22, 0.08, s);
          return 1.04 * T;
        case "bridge":
          for (let w = 0; w < 12; w += 1) m(0, 0.16, -0.46 + w * 0.083, 1, 0.1, 0.075, w % 2 ? 0.1 : 0);
          for (const w of [-0.45, 0.45]) {
            m(w, 0.61, 0, 0.045, 0.045, 1, -0.15);
            for (const O of [
              -0.45,
              0,
              0.45
            ]) m(w, 0.35, O, 0.055, 0.55, 0.04, -0.18);
          }
          return 0.65 * T;
        case "tree":
          return m(0, 0.44, 0, 0.14, 0.88, 0.14, -0.42, a), m(0, 1.04, 0, 1, 1.2, 1, -0.04, r), m(-0.16, 1.3, -0.06, 0.6, 0.65, 0.6, 0.13, r), 1.65 * T;
        case "rock":
          return m(0, 0.29, 0, 1, 0.62, 1, 0.03, c), 0.6 * T;
        default:
          return fn(g, p, m, {
            cylinder: a,
            ring: l,
            cone: h
          }) * T;
      }
    }
    const x = _();
    for (const { geometry: w, material: O, matrices: k } of b.values()) {
      const D = e.own(new ne(w, O, k.length));
      k.forEach((H, A) => D.setMatrixAt(A, H)), D.castShadow = O.opacity >= 0.8, D.receiveShadow = !0, u.add(D);
    }
    return x;
  };
}
var mn = /* @__PURE__ */ JSON.parse('[{"icon":"table","file":"table.glb","originalFile":"furniture/Models/GLTF format/table.glb","sourceSha256":"ff1a94498d023957f4bc3ff6f55a7a82977d336dbf01a573b3364f03afe5ff61","sha256":"07cd3bfb1f6884b7476a2e6222f735bbd0e7ff9b29c59f210d9a06fe9f1ba5e8","bytes":12476,"triangles":120,"batches":1,"geometryBytes":11520,"size":[0.8414879441261292,0.3267339766025543,0.44737333059310913],"radius":0.4765094062648687},{"icon":"chair","file":"chairRounded.glb","originalFile":"furniture/Models/GLTF format/chairRounded.glb","sourceSha256":"53f4933ec547179c499f04dbda1231cf44b83ec82c7f4ab981cdf680aee5c973","sha256":"f62c6c7e655f8360971bd859c14c150a1f77355f14b5379b29cdd6d1fb97db4c","bytes":27844,"triangles":280,"batches":1,"geometryBytes":26880,"size":[0.20000000298023224,0.45499998331069946,0.20000000298023224],"radius":0.14142135834465194},{"icon":"bed","file":"bedSingle.glb","originalFile":"furniture/Models/GLTF format/bedSingle.glb","sourceSha256":"ca00c63f9a12da3138d902b2f5f18e0360fb6e8a5ac42ccb4bc3f185724b65d1","sha256":"b89c28f9ad8e77ddbc8fd9bcfb8a8f87157a7c8971dd20ee0718b6f585629c89","bytes":22864,"triangles":214,"batches":3,"geometryBytes":20544,"size":[0.5709999799728394,0.375,1.125],"radius":0.6294541280557842},{"icon":"shelf","file":"bookcaseOpenLow.glb","originalFile":"furniture/Models/GLTF format/bookcaseOpenLow.glb","sourceSha256":"6d4d625faf977a2dbf155f1313cd32c6310e463114a1cd4c08cb9f80a5fb1d75","sha256":"c67a8d18cd802afb82d74a73d0c0dc85a7188facbfb5ede13909b9bc6cc33226","bytes":18596,"triangles":184,"batches":1,"geometryBytes":17664,"size":[0.4000000059604645,0.4000000059604645,0.25],"radius":0.23584953082864699},{"icon":"tree","file":"tree_oak.glb","originalFile":"nature/Models/GLTF format/tree_oak.glb","sourceSha256":"d7fd8773674928c50c11b66d12c636d49bdcc15a8b1c7fbb98e6f63a3439a3f3","sha256":"adb24a59f159f214971fefe7e51539d7a938a8a3908b0d756c25e914d0bce681","bytes":20500,"triangles":196,"batches":2,"geometryBytes":18816,"size":[0.6405540108680725,1.2262399204075336,0.7396479845046997],"radius":0.36982402101696993},{"icon":"rock","file":"stone_largeE.glb","originalFile":"nature/Models/GLTF format/stone_largeE.glb","sourceSha256":"392cf28f85aa4b7b7c5e12b1a3b87fe2b3a7c5ec1797d5d1d0d58edca6da9de8","sha256":"07185b2e5f8ce40fc14e8c29db249fa607da56651abcf22f93f8c02f4d7512af","bytes":7116,"triangles":64,"batches":1,"geometryBytes":6144,"size":[1.095458745956421,0.2922479815781114,0.9198710918426514],"radius":0.5865749968024526},{"icon":"stool","file":"stoolBar.glb","originalFile":"furniture/Models/GLTF format/stoolBar.glb","sourceSha256":"a86167a9f92401a61fec7e509ad089ecc552d0f299743add3aeb919acb24e341","sha256":"6fe6e654458f50ab7e73cc5977f055a50562cb74a56a8bd5ebaac312f03c4563","bytes":17852,"triangles":176,"batches":1,"geometryBytes":16896,"size":[0.2654399871826172,0.4350000023841858,0.2298777848482132],"radius":0.13272000284524055},{"icon":"bench","file":"bench.glb","originalFile":"furniture/Models/GLTF format/bench.glb","sourceSha256":"ba05a6d23a5a5a44da016757632070e47ff7587ce10e2f6d6d52328b4cf5489b","sha256":"21bd02dce1f980aff3bc22c916bdcbefa3db2fa11bd5dbbc9fbb07830f9bd87b","bytes":17280,"triangles":170,"batches":1,"geometryBytes":16320,"size":[0.4000000059604645,0.4699999988079071,0.20000000298023224],"radius":0.22360680108197992},{"icon":"sofa","file":"loungeSofa.glb","originalFile":"furniture/Models/GLTF format/loungeSofa.glb","sourceSha256":"1886b811c0d3ad0d8525a4fd43adf4112c497c8e0ed906f06877ca3517f4c7dd","sha256":"a4a0b16aa48731b61fcc08302c8bca8d2ff9e1ae41e77893ed9f2091f8a35ee2","bytes":13952,"triangles":128,"batches":2,"geometryBytes":12288,"size":[0.9799999594688416,0.46000000834465027,0.4100000262260437],"radius":0.5311543895291386},{"icon":"cabinet","file":"kitchenCabinet.glb","originalFile":"furniture/Models/GLTF format/kitchenCabinet.glb","sourceSha256":"7238c57778935ae25db5e57e9f7af3ba7068c71b005ff7cfbff3b6f3b1a13200","sha256":"0f9b3693f3de853fa68148bb71c9e29ecf38e784bfa7e39a7fb3cc78f76ce972","bytes":12604,"triangles":114,"batches":2,"geometryBytes":10944,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"stove","file":"kitchenStove.glb","originalFile":"furniture/Models/GLTF format/kitchenStove.glb","sourceSha256":"3239edb36295dfca9530a9b9a6ad0aff98ce62e7cf8d13ca2a5a1a6b2a904656","sha256":"6d1deee24fa30890cbfc540fa6e711fce2ab68cc82d0b68e104074c2c161b170","bytes":81356,"triangles":830,"batches":2,"geometryBytes":79680,"size":[0.4300000071525574,0.44999998807907104,0.44999998807907104],"radius":0.3112073245532484},{"icon":"refrigerator","file":"kitchenFridge.glb","originalFile":"furniture/Models/GLTF format/kitchenFridge.glb","sourceSha256":"8af4f4bbb1b5525ad8226e97926a5af60fa8fb20a3cb74dbda5328a9d320dbab","sha256":"69be9a8c3d3a804c494b92220710c61a2f87a4c3600922d0da3d5020eb3aef4c","bytes":25668,"triangles":250,"batches":2,"geometryBytes":24000,"size":[0.4300000071525574,0.9200000166893005,0.29193389415740967],"radius":0.2598679494998898},{"icon":"sink","file":"kitchenSink.glb","originalFile":"furniture/Models/GLTF format/kitchenSink.glb","sourceSha256":"7b9610277d71f00dcf1bba49cf4d98d77ce5177e84bf76c7da2f8893e542f743","sha256":"7063bb1597aae39279a3430952338d6f72fe8bccba5b93b143b930ba992f3878","bytes":32196,"triangles":318,"batches":2,"geometryBytes":30528,"size":[0.4300000071525574,0.4899999797344208,0.44999998807907104],"radius":0.3112073245532484},{"icon":"toilet","file":"toilet.glb","originalFile":"furniture/Models/GLTF format/toilet.glb","sourceSha256":"16165cfd03c56c2cb443b800570810a22ef770f65e7a468f6761d9dc14eaaeae","sha256":"42fcec7b0b225b544dcf05bde35f17e598cdf01c8f5f15f36aa55c76ab91652f","bytes":23732,"triangles":230,"batches":2,"geometryBytes":22080,"size":[0.31255000829696655,0.450965017080307,0.4771767109632492],"radius":0.2827908769988002},{"icon":"bathtub","file":"bathtub.glb","originalFile":"furniture/Models/GLTF format/bathtub.glb","sourceSha256":"54c405c7035aab63dc41e709dc3c50fc5bcfbc4cddc91ffc54188075a6d25d01","sha256":"f15e3a3316060b4ddca2dd1350109adc26bc11f1a4784e8dcb23465ccdb3cb5a","bytes":59480,"triangles":602,"batches":2,"geometryBytes":57792,"size":[0.5600000023841858,0.41999998688697815,1.190000057220459],"radius":0.6478308291120068},{"icon":"potted-plant","file":"pottedPlant.glb","originalFile":"furniture/Models/GLTF format/pottedPlant.glb","sourceSha256":"5b760eda2766f75fda36b2c5df652a1662f82981ef64cd8fa7fe7bcd386b3a15","sha256":"d6be69190662ff9b0388b7332f9a8d8e0530d1373b5a3c08deea336ea09613e7","bytes":7420,"triangles":60,"batches":2,"geometryBytes":5760,"size":[0.21205927431583405,0.6540167927742004,0.24146194756031036],"radius":0.12073097378015518},{"icon":"light","file":"lampRoundFloor.glb","originalFile":"furniture/Models/GLTF format/lampRoundFloor.glb","sourceSha256":"50fe1b5b588edf15bfa9cc880f71a02a4fda6036350b24733d0ef4de5cc5e908","sha256":"f663a0f42fc9277cfc365f4ccc335fe8a80d621159dae74922dd8c3947fd2b36","bytes":8956,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.15203941613435745,0.8600000143051147,0.17555999755859375],"radius":0.08778000315811903},{"icon":"statue","file":"statue_ring.glb","originalFile":"nature/Models/GLTF format/statue_ring.glb","sourceSha256":"5c62e4165f7a76436faa0b20e98b47d0a9e5021dcbf2a0eef0cdf0912180f02c","sha256":"013b58818fbebae606f6cb9b5bc7f769ac6f55dbf5bc1c486787078a8761d29c","bytes":8976,"triangles":76,"batches":2,"geometryBytes":7296,"size":[0.6000000238418579,0.7964101441204547,0.4000000059604645],"radius":0.3605551391183468},{"icon":"chest","file":"chest.glb","originalFile":"survival/Models/GLB format/chest.glb","sourceSha256":"84b03023e425cc1f96c6d0b0f352608be9e8e01b112790e6b00b8651bf84379b","sha256":"dfaf5cf144a7465e313e87d08eb82b0039202500256a6e89f774d0a1e9c35946","bytes":32580,"triangles":322,"batches":2,"geometryBytes":30912,"size":[0.2603999972343445,0.2571914792060852,0.2720249891281128],"radius":0.18828552338788324},{"icon":"barrel","file":"barrel.glb","originalFile":"survival/Models/GLB format/barrel.glb","sourceSha256":"3a0d12f6bdd1badd361f64ce0fbbf878a4ccfc2de8ff1ac4ed4c1aea2a9ee04a","sha256":"3b1f6cdf0e406cdf9630649a1eca8bdf8428a9f07d794bafd70406e63dafa6e3","bytes":41228,"triangles":412,"batches":2,"geometryBytes":39552,"size":[0.23649999499320984,0.3440000116825104,0.23649999499320984],"radius":0.13364122923364707},{"icon":"tent","file":"tent-canvas.glb","originalFile":"survival/Models/GLB format/tent-canvas.glb","sourceSha256":"efc4bca46a22e4cc4fe391aeafba161c24bc39bfa75e192c57eaacaf686f9717","sha256":"8baaab74d57cfa38d73963dccd6fe711006d28ebef0145a410494625f4cc0b9d","bytes":15868,"triangles":148,"batches":2,"geometryBytes":14208,"size":[0.5607622265815735,0.4913683533668518,0.5610000491142273],"radius":0.37933337775768333},{"icon":"car","file":"sedan.glb","originalFile":"car/Models/GLB format/sedan.glb","sourceSha256":"b532ea7d2c59f7f6b22b138cf1955218a2c1898f1cea932af4d3fd563c3959b7","sha256":"99b2d9141e842d542c406b83a3f8701519cad9f5a4f4d046b7b0d6f8cf12c0f8","bytes":197452,"triangles":2032,"batches":3,"geometryBytes":195072,"size":[1.5,1.2999999523162844,2.549999952316284],"radius":1.3472214803586575}]'), gn = new Map(mn.map((e) => [e.icon, {
  size: new E().fromArray(e.size),
  radius: e.radius
}])), ht = {
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
}, bn = /* @__PURE__ */ new Set([
  "tree",
  "rock",
  "stool",
  "barrel",
  "potted-plant",
  "light"
]), yn = {
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
function Lt(e) {
  if (de(e) || ["wall", "grid"].includes(e.category) || !e.icon || !Object.hasOwn(ht, e.icon)) return;
  const t = e.icon;
  if (e.shape === "circle") return bn.has(t) ? t : void 0;
  if (e.shape !== "rect") return;
  const { width: n, height: s } = bt(e), i = n / s, [o, a] = ht[t];
  return i >= o && i <= a ? t : void 0;
}
function Pt(e, t, { size: n, radius: s }, i, o) {
  const a = t === "shelf" ? Math.max(1, Math.ceil(i / o / (n.x / n.z))) : 1, r = Math.min((t === "tree" ? 3 : 2.5) / n.y, e.shape === "circle" ? i / (2 * s) : Math.min(i / a / n.x, o / n.z));
  return {
    count: a,
    scale: r,
    height: n.y * r
  };
}
function wn(e, t, n, s) {
  return Pt(e, t, gn.get(t), n, s).height;
}
function _n(e, t, n, s, i, o, a, r) {
  const { size: c } = s, { count: h, scale: l, height: d } = Pt(t, n, s, i, o), u = t.material ? t : {
    ...t,
    material: yn[n] || "unknown"
  };
  for (const p of s.parts) {
    const g = a.own(p.geometry.clone());
    if (g.scale(l, l, l), n === "table") {
      const y = g.getAttribute("position"), _ = c.x * l / 2, x = i / 2 - _;
      for (let w = 0; w < y.count; w++) {
        if (y.getY(w) < c.y * l * 0.55) continue;
        const O = y.getX(w);
        y.setX(w, O + Math.max(-1, Math.min(1, O / (_ * 0.5))) * x);
      }
      g.computeVertexNormals();
    }
    g.computeBoundingBox(), g.computeBoundingSphere();
    let f = u;
    p.role === "soft" || p.role === "shade" ? f = {
      ...t,
      material: "bed-sheet"
    } : p.role === "foliage" ? f = {
      ...t,
      material: "forest"
    } : p.role === "window" ? f = {
      ...t,
      material: "glass"
    } : p.role === "wood" ? f = {
      ...t,
      material: "wood"
    } : p.role === "bark" && (!t.material || ["grass", "forest"].includes(t.material)) && (f = {
      ...t,
      material: "wood"
    });
    const M = p.role === "detail" ? n === "car" ? -0.78 : -0.25 : p.role === "bark" ? -0.22 : p.role === "window" ? -0.3 : p.role === "soft" ? 0.12 : 0, T = n === "light" && p.role === "shade" ? r.lampShade(t, M) : r.mesh(f, M), b = a.own(new ne(g, T, h));
    for (let y = 0; y < h; y++) b.setMatrixAt(y, new Z().makeTranslation((y - (h - 1) / 2) * c.x * l, 0, 0));
    const m = n === "light" && p.role === "shade" && T.emissiveIntensity > 0 && T.emissive.getHex() !== 0;
    b.castShadow = T.opacity >= 0.8 && !m, b.receiveShadow = !0, e.add(b);
  }
  return d;
}
function Tn(e, t, n, s, i, o) {
  const a = Rt(t, n), r = [], c = Math.max(0.45, a.reduce((d, u) => d + u.length, 0) / 128);
  let h = 0;
  for (const d of a) {
    for (const u of [0.22, 0.5]) r.push(new Z().makeRotationY(d.rotation).scale(new E(d.length, 0.045, 0.04)).setPosition(d.x, u, d.z));
    for (; h <= d.length; ) {
      const u = h - d.length / 2;
      r.push(new Z().makeScale(0.065, 0.58, 0.065).setPosition(d.x + Math.cos(d.rotation) * u, 0.29, d.z - Math.sin(d.rotation) * u)), h += c;
    }
    h -= d.length;
  }
  if (!n && t.length) {
    const d = t.at(-1);
    r.push(new Z().makeScale(0.065, 0.58, 0.065).setPosition(d.x, 0.29, d.y));
  }
  const l = o.own(new ne(s, i, r.length));
  return r.forEach((d, u) => l.setMatrixAt(u, d)), l.castShadow = i.opacity >= 0.8, l.receiveShadow = !0, e.add(l), 0.58;
}
function je(e, t, n = 10) {
  const s = [], i = [], o = [], a = new E(0, 1, 0);
  e.forEach((c, h) => {
    const l = e[Math.min(h + 1, e.length - 1)].clone().sub(e[Math.max(0, h - 1)]).normalize(), d = new E().crossVectors(l, Math.abs(l.y) > 0.95 ? new E(1, 0, 0) : a).normalize(), u = new E().crossVectors(l, d).normalize(), p = h / (e.length - 1), g = t(p);
    for (let f = 0; f <= n; f++) {
      const M = f / n * Math.PI * 2, T = c.clone().addScaledVector(d, Math.cos(M) * g).addScaledVector(u, Math.sin(M) * g);
      if (s.push(T.x, T.y, T.z), o.push(f / n, p), h && f < n) {
        const b = (h - 1) * (n + 1) + f, m = h * (n + 1) + f;
        i.push(b, m, b + 1, m, m + 1, b + 1);
      }
    }
  });
  for (const c of [0, e.length - 1]) {
    const h = s.length / 3, l = e[c], d = c * (n + 1);
    s.push(l.x, l.y, l.z), o.push(0.5, c ? 1 : 0);
    for (let u = 0; u < n; u++) i.push(h, d + u + (c ? 0 : 1), d + u + (c ? 1 : 0));
  }
  const r = new Se();
  return r.setAttribute("position", new Me(s, 3)), r.setAttribute("uv", new Me(o, 2)), r.setIndex(i), r.computeVertexNormals(), r;
}
function xn(e, t, n, s, i) {
  const o = t.icon, a = gt(t), r = n.filter((f, M) => !M || !f.equals(n[M - 1]));
  if (r.length < 2) return 0;
  const c = [0];
  for (let f = 1; f < r.length; f++) c.push(c[f - 1] + r[f].distanceTo(r[f - 1]));
  const h = c[c.length - 1], l = Math.min(o === "tentacle" ? 0.22 : 0.09, Math.max(0.025, h * 0.035)), d = (f) => o === "pipe" ? l : l * (0.08 + 0.92 * (1 - f) ** 0.7), u = r.map((f, M) => d(M / (r.length - 1))), p = r.map((f, M) => {
    const T = M / (r.length - 1);
    return new E(f.x, u[M] + (o === "tentacle" ? Math.sin(T * Math.PI) * l * 1.6 : 0), f.y);
  }), g = new K(s.own(je(p, d)), i.mesh({
    ...t,
    material: a
  }));
  if (g.castShadow = g.receiveShadow = !0, e.add(g), o === "vine" || o === "tentacle") {
    const f = Math.min(24, Math.max(2, Math.floor(h * 3))), M = s.own(new Ye(1, 8, 6)), T = s.own(new ne(M, i.mesh({
      ...t,
      material: a
    }, o === "vine" ? 0.12 : 0.3), f));
    let b = 0;
    for (let m = 0; m < f; m++) {
      const y = (m + 0.5) / f * h;
      for (; b < r.length - 2 && c[b + 1] < y; ) b++;
      const _ = (y - c[b]) / (c[b + 1] - c[b]), x = p[b].clone().lerp(p[b + 1], _), w = u[b] + (u[b + 1] - u[b]) * _, O = m % 2 ? -1 : 1, k = r[b + 1].clone().sub(r[b]).normalize();
      x.add(new E(k.y, 0, -k.x).multiplyScalar(o === "vine" ? O * w * 1.2 : 0)), x.y += w * 0.65;
      const D = new xe().setFromAxisAngle(new E(0, 1, 0), Math.atan2(k.x, k.y) + O * 0.75), H = o === "vine" ? new E(w * 2.1, w * 0.3, w * 0.8) : new E(w * 0.5, w * 0.28, w * 0.55);
      T.setMatrixAt(m, new Z().compose(x, D, H));
    }
    T.castShadow = T.receiveShadow = !0, e.add(T);
  }
  return Math.max(...p.map((f) => f.y)) + l;
}
function Mn(e, t) {
  const n = e.own(new Ye(1, 20, 14)), s = e.own(new St(1, 1, 6)), i = e.own(new Xe(1, 1, 1, 12)), o = e.own(new Tt(1, 0)), a = /* @__PURE__ */ new Map();
  return (r, c, h, l) => {
    const d = c.icon, u = gt(c), p = `${d}:${u}:${c.certainty}:${c.category}`;
    if (!a.has(p)) {
      let x = function(A, R, S, U, j, P, I, C = 0, G = u) {
        const z = new K(A, t.mesh({
          ...c,
          material: G
        }, C));
        return z.position.set(R, S, U), z.scale.set(j, P, I), z.castShadow = z.material.opacity >= 0.8, z.receiveShadow = !0, _.add(z), z;
      }, w = function(A, R, S, U) {
        for (const j of [-1, 1]) x(n, j * A, R, S, U, U * 1.4, U * 0.65, -0.92, "stone");
      };
      const _ = new be();
      if (d === "slime")
        x(n, 0, 0.25, 0, 0.47, 0.25, 0.45), x(n, -0.04, 0.48, -0.03, 0.34, 0.38, 0.33, 0.06), w(0.105, 0.49, 0.29, 0.028);
      else if (d === "mushroom") {
        x(i, 0, 0.34, 0, 0.105, 0.68, 0.1, 0.25, "wood"), x(n, 0, 0.65, 0, 0.5, 0.22, 0.48), x(n, 0, 0.6, 0, 0.46, 0.04, 0.44, 0.45, "fabric");
        for (const [A, R, S] of [
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
        ]) x(n, A, 0.82 - (A * A + R * R) * 0.48, R, S, 0.022, S, 0.65);
      } else if (d === "crystal")
        x(o, 0, 0.62, 0, 0.23, 0.64, 0.24, 0.05).rotation.z = -0.12, x(o, -0.28, 0.3, 0.14, 0.13, 0.38, 0.15, -0.13).rotation.z = 0.3, x(o, 0.27, 0.26, -0.05, 0.15, 0.34, 0.17, 0.12).rotation.z = -0.36;
      else if (d === "dragon") {
        x(n, 0, 0.35, 0.02, 0.16, 0.22, 0.28), x(n, 0, 0.62, 0.22, 0.095, 0.24, 0.11, 0.04).rotation.x = -0.3, x(n, 0, 0.84, 0.3, 0.12, 0.11, 0.18, 0.12), x(n, 0, 0.79, 0.41, 0.085, 0.05, 0.13, 0.2);
        for (const R of [-1, 1]) {
          for (const C of [-0.13, 0.21]) x(n, R * 0.15, 0.15, C, 0.065, 0.16, 0.065, -0.08);
          x(s, R * 0.08, 0.99, 0.23, 0.035, 0.2, 0.045, 0.35, "wood").rotation.z = -R * 0.3;
          const S = [
            new E(R * 0.1, 0.46, -0.06),
            new E(R * 0.26, 0.7, -0.24),
            new E(R * 0.47, 0.85, -0.26)
          ], U = new K(e.own(je(S, (C) => 0.022 * (1 - C * 0.8), 6)), t.mesh({
            ...c,
            material: u
          }, 0.2));
          _.add(U);
          const j = e.own(new Se()), P = [
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
          j.setAttribute("position", new Me(P.flatMap(([C, G, z]) => [
            R * C,
            G,
            z
          ]), 3)), j.setAttribute("uv", new Me(P.flatMap(([C, , G]) => [C, G]), 2)), j.setIndex([
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
          ]), j.computeVertexNormals();
          const I = new K(j, t.mesh({
            ...c,
            material: u
          }, -0.18));
          I.castShadow = I.receiveShadow = !0, _.add(I);
        }
        const A = e.own(je([
          new E(0, 0.27, -0.16),
          new E(0.12, 0.13, -0.3),
          new E(0.29, 0.08, -0.42),
          new E(0.37, 0.04, -0.33)
        ], (R) => 0.09 * (1 - R) + 5e-3));
        _.add(new K(A, t.mesh({
          ...c,
          material: u
        }))), w(0.075, 0.87, 0.43, 0.016);
      } else {
        const A = d === "dwarf", R = A ? 0.3 : 0.19;
        x(s, 0, 0.46, 0, R, 0.66, R * 0.75, -0.04), x(n, 0, 0.89, 0, A ? 0.21 : 0.15, 0.21, 0.15, 0.38, "wood");
        for (const S of [-1, 1])
          x(i, S * R * 0.75, 0.14, 0.015, 0.055, 0.27, 0.07, -0.35, "wood"), x(n, S * R, 0.55, 0.015, 0.075, 0.23, 0.08, 0.06).rotation.z = S * 0.25;
        if (A)
          x(n, 0, 1.02, -5e-3, 0.225, 0.14, 0.18, 0.1, "metal"), x(s, 0, 0.71, 0.16, 0.18, 0.37, 0.12, -0.2, "wood").rotation.z = Math.PI, x(i, 0, 0.5, 0, 0.3, 0.07, 0.235, -0.25, "wood");
        else {
          for (const S of [-1, 1]) x(s, S * 0.19, 0.94, 0, 0.06, 0.23, 0.035, 0.38, "wood").rotation.z = -S * 1.1;
          x(n, 0, 1.02, -0.05, 0.17, 0.1, 0.15, -0.28, "wood");
        }
        w(0.06, 0.9, 0.135, 0.015);
      }
      _.updateMatrixWorld(!0);
      const O = /* @__PURE__ */ new Map();
      _.traverse((A) => {
        if (!(A instanceof K)) return;
        const R = A.material, S = A.geometry.index ? A.geometry.toNonIndexed() : A.geometry.clone();
        S.applyMatrix4(A.matrixWorld), O.has(R) || O.set(R, []), O.get(R).push(S);
      }), _.clear();
      for (const [A, R] of O) {
        let S;
        try {
          S = Gs(R);
        } finally {
          R.forEach((j) => j.dispose());
        }
        if (!S) throw new Error("map_sculpture_geometry_invalid");
        const U = new K(e.own(S), A);
        U.castShadow = A.opacity >= 0.8, U.receiveShadow = !0, _.add(U);
      }
      const k = new ae().setFromObject(_), D = k.getCenter(new E());
      let H = 0;
      _.traverse((A) => {
        if (!(A instanceof K)) return;
        const R = A.geometry.getAttribute("position");
        for (let S = 0; S < R.count; S++) {
          const U = new E().fromBufferAttribute(R, S).sub(D);
          H = Math.max(H, Math.hypot(U.x, U.z));
        }
      }), a.set(p, {
        group: _,
        box: k,
        radius: H
      });
    }
    const g = a.get(p), f = g.group.clone(!0), { box: M, radius: T } = g, b = M.getSize(new E()), m = M.getCenter(new E()), y = Math.min(h / b.x, l / b.z, 2.8 / b.y, c.shape === "circle" ? h / (2 * T) : 1 / 0);
    return f.scale.setScalar(y), f.position.set(-m.x * y, -M.min.y * y, -m.z * y), r.add(f), b.y * y;
  };
}
function Sn(e) {
  const n = new Uint8Array(9216);
  for (let r = 0; r < 48; r++) for (let c = 0; c < 48; c++) {
    const h = Math.hypot((c + 0.5) / 48 * 2 - 1, (r + 0.5) / 48 * 2 - 1);
    n[(r * 48 + c) * 4 + 3] = Math.round(Math.max(0, 1 - h) ** 1.5 * 120);
  }
  const s = e.own(new Ke(n, 48, 48, Ve));
  s.magFilter = s.minFilter = Le, s.needsUpdate = !0;
  const i = e.own(new Es(0.5, 32).rotateX(-Math.PI / 2)), o = /* @__PURE__ */ new Map();
  let a = 0;
  return (r, c, h, l) => {
    if (a++ >= 96) return;
    o.has(l) || o.set(l, e.own(new ge({
      map: s,
      transparent: !0,
      opacity: l,
      depthWrite: !1,
      toneMapped: !1,
      polygonOffset: !0,
      polygonOffsetFactor: -1
    })));
    const d = new K(i, o.get(l));
    d.scale.set(c, 1, h), d.position.y = 0.019, r.add(d);
  };
}
function En(e, t) {
  let n = !1;
  for (let s = 0, i = t.length - 1; s < t.length; i = s++) {
    const o = t[s], a = t[i];
    o.y > e.y != a.y > e.y && e.x < (a.x - o.x) * (e.y - o.y) / (a.y - o.y) + o.x && (n = !n);
  }
  return n;
}
function vn(e, t, n, s = nn(e)) {
  const i = new At(), o = new be();
  try {
    const a = un(i, t, e.lighting), r = pn(i, a), c = Mn(i, a), h = Sn(i), l = i.own(new Mt(1, 1, 1)), d = i.own(new Tt(0.5, 1)), u = i.own(new Xe(0.055, 0.08, 1, 6)), p = Kt(e.elements), g = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ new Map(), M = [], T = new ae();
    for (const [m, y] of qt(e.elements).entries()) {
      const _ = on(y, s.scale), x = new be();
      let w = 0.015, O = !1;
      const k = sn(y), D = Xt(y), H = $t(y), A = Lt(y), R = A && n?.get(A), S = y.icon === "fence" && ["path", "curve"].includes(y.shape) && !de(y) && !["wall", "grid"].includes(y.category), U = !k && !de(y) && Je(y) && (Yt(y) || ["furniture", "decoration"].includes(y.category));
      if (y.shape === "icon" || y.shape === "label") w = 0.08;
      else if (y.category === "wall") {
        w = 1.1;
        const P = Rt(_.points, _.closed), I = i.own(new ne(l, a.mesh(y, 0.12), P.length));
        I.castShadow = I.receiveShadow = !0, x.add(I), P.forEach((C, G) => {
          const z = new Z().makeRotationY(C.rotation).scale(new E(C.length, w, 0.08)).setPosition(C.x, w / 2, C.z);
          I.setMatrixAt(G, z);
        }), M.push(I);
      } else if (S) w = Tn(x, _.points, _.closed, l, a.mesh(y), i);
      else if (H) w = xn(x, y, _.points, i, a);
      else if (D) w = c(x, y, _.width, _.depth);
      else if (A && R) w = _n(x, y, A, R, _.width, _.depth, i, a);
      else if (k) w = r(x, y, k, _.width, _.depth);
      else if (Je(y)) {
        w = U ? 0.2 : 0.015;
        const P = y.category === "terrain" ? 0.14 : w, I = i.own(an(_.points, P));
        I.translate(0, w - P, 0);
        const C = new K(I, y.category === "terrain" && !U ? a.ground(y) : a.mesh(y));
        C.castShadow = w > 0.1, C.receiveShadow = !0, x.add(C);
      } else if (y.category === "road" || y.category === "water") {
        const P = new K(i.own(cn(_.points, _.closed, y.category === "road" ? 0.16 : 0.08).translate(0, w, 0)), a.mesh(y));
        P.receiveShadow = !0, x.add(P);
      }
      if (k || R || D) {
        const P = new ae().setFromObject(x), I = Math.max(_.width, _.depth) * 1e-6;
        O = P.min.x > -_.width / 2 + I || P.max.x < _.width / 2 - I || P.min.z > -_.depth / 2 + I || P.max.z < _.depth / 2 - I;
      }
      if ((k || R || D) && _.width > 0 && _.depth > 0 && h(x, _.width, _.depth, ve(y, "").opacity), _.points.length && !H && (O || !k && !R && !D)) {
        const P = new yt(i.own(rn(_.points, _.closed, O ? 0.019 : y.category === "wall" ? 0.012 : w + 4e-3)), a.line(y));
        P.computeLineDistances(), x.add(P);
      }
      const j = (p.get(y.id) || []).flatMap((P) => {
        const I = new B((P.x - _.center[0]) / s.scale, (P.y - _.center[1]) / s.scale), C = P.size / s.scale / 2;
        return Array.from({ length: 8 }, (G, z) => new B(I.x + C * Math.cos(z * Math.PI / 4), I.y + C * Math.sin(z * Math.PI / 4))).every((G) => En(G, _.points)) ? [{
          center: I,
          radius: C
        }] : [];
      });
      if (j.length) {
        const P = new ne(d, a.mesh(y, -0.03), j.length * 3), I = i.own(new ne(u, a.mesh({
          ...y,
          material: "wood"
        }, -0.25), j.length));
        j.forEach(({ center: C, radius: G }, z) => {
          const X = G * 1.6;
          I.setMatrixAt(z, new Z().makeScale(G, X, G).setPosition(C.x, X / 2 + w, C.y));
          for (let q = 0; q < 3; q++) {
            const ue = z * 3 + q, fe = q === 0 ? 1.55 : 1.1;
            P.setMatrixAt(ue, new Z().makeRotationY(z * 2.4 + q).scale(new E(G * fe, G * fe * 0.9, G * fe)).setPosition(C.x + (q === 1 ? -0.3 : q === 2 ? 0.3 : 0) * G, w + G * (q === 0 ? 1.8 : 1.35), C.y)), P.setColorAt(ue, new se().setScalar(0.84 + z % 5 * 0.03 + (q === 0 ? 0.08 : 0)));
          }
        }), P.castShadow = P.receiveShadow = !0, I.castShadow = I.receiveShadow = !0, i.own(P), x.add(I, P);
      }
      if (x.position.copy(s.point(..._.center, m * 2e-3)), x.rotation.y = _.rotation, o.add(x), A) {
        const P = wn(y, A, _.width, _.depth) + 0.1;
        x.updateMatrix(), T.union(new ae(new E(-_.width / 2, 0, -_.depth / 2), new E(_.width / 2, P, _.depth / 2)).applyMatrix4(x.matrix));
      }
      de(y) ? (g.set(y.id, s.point(..._.center, x.position.y + 0.025)), D && f.set(y.id, s.point(..._.center, x.position.y + w + 0.06))) : k || A || U || D ? g.set(y.id, s.point(..._.center, x.position.y + w + 0.1)) : g.set(y.id, s.point(...Vt(y, 0), x.position.y + (S || H ? w : 0) + 0.1));
    }
    const b = new ae().setFromObject(o).union(T);
    for (const m of g.values()) b.expandByPoint(m);
    for (const m of f.values()) b.expandByPoint(m);
    return {
      group: o,
      anchors: g,
      markerTops: f,
      bounds: b,
      frame: s,
      updateWalls(m) {
        for (const y of M) y.scale.y = m ? 0.2 / 1.1 : 1;
      },
      dispose() {
        o.removeFromParent(), i.dispose(), o.clear();
      }
    };
  } catch (a) {
    throw i.dispose(), o.clear(), a;
  }
}
var dt = (e, t) => e.x < t.x + t.w + 3 && e.x + e.w + 3 > t.x && e.y < t.y + t.h + 3 && e.y + e.h + 3 > t.y;
function Rn(e, t, n, s = []) {
  const i = /* @__PURE__ */ new Map(), o = [...e].sort((l, d) => l.priority - d.priority || l.id.localeCompare(d.id)), a = [...s], r = o.filter((l) => l.badge).map(({ anchor: l }) => ({
    x: l.x - 3,
    y: l.y - 3,
    w: 6,
    h: 6
  })), c = (l) => l.x >= 3 && l.y >= 3 && l.x + l.w <= t - 3 && l.y + l.h <= n - 3, h = (l) => c(l) && !a.some((d) => dt(l, d)) && !r.some((d) => dt(l, d));
  for (const l of o) {
    const d = { anchor: { ...l.anchor } };
    if (i.set(l.id, d), !l.badge) continue;
    const { w: u, h: p } = l.badge, { x: g, y: f } = l.badgeAnchor || l.anchor, M = [];
    for (const b of [
      9,
      27,
      45
    ]) M.push({
      x: g - u / 2,
      y: f - p - b,
      w: u,
      h: p
    }, {
      x: g + b,
      y: f - p / 2,
      w: u,
      h: p
    }, {
      x: g - u - b,
      y: f - p / 2,
      w: u,
      h: p
    }, {
      x: g - u / 2,
      y: f + b,
      w: u,
      h: p
    });
    const T = M.map((b) => ({
      x: Math.max(3, Math.min(t - u - 3, b.x)),
      y: Math.max(3, Math.min(n - p - 3, b.y)),
      w: u,
      h: p
    }));
    d.badge = T.find(h) || T[0], a.push(d.badge);
  }
  for (const l of o) {
    if (!l.caption) continue;
    const d = i.get(l.id), { w: u, h: p } = l.caption, g = d.badge || {
      ...l.anchor,
      w: 0,
      h: 0
    };
    d.caption = [
      {
        x: g.x + (g.w - u) / 2,
        y: g.y - p - 5,
        w: u,
        h: p
      },
      {
        x: g.x + g.w + 6,
        y: g.y + (g.h - p) / 2,
        w: u,
        h: p
      },
      {
        x: g.x - u - 6,
        y: g.y + (g.h - p) / 2,
        w: u,
        h: p
      },
      {
        x: g.x + (g.w - u) / 2,
        y: g.y + g.h + 5,
        w: u,
        h: p
      }
    ].find(h), d.caption && a.push(d.caption);
  }
  return i;
}
function An(e, t, n, s) {
  const i = t.elements.filter((o) => o.label || de(o)).map((o) => {
    const a = de(o) && o.shape !== "label", r = o.actorKey === "player", c = r ? 0 : o.category === "door" ? 1 : o.category === "actor" ? 2 : a ? 3 : 4, h = o.label || Ht[o.category], l = document.createElement("span");
    l.className = `map-3d-label is-${o.category}${r ? " is-player" : ""}`, l.dataset.element = o.id, l.style.zIndex = String(10 - c), a && (l.setAttribute("role", "img"), l.setAttribute("aria-label", h));
    const d = ve(o, "");
    l.style.opacity = String(d.opacity);
    const u = document.createElement("span");
    u.className = "map-3d-glyph", u.setAttribute("aria-hidden", "true");
    const p = document.createElement("span");
    p.className = "map-3d-anchor", p.setAttribute("aria-hidden", "true");
    const g = document.createElement("span");
    g.className = "map-3d-leader", g.setAttribute("aria-hidden", "true"), a && l.append(g, p, u);
    const f = document.createElement("span");
    return f.textContent = h, f.className = "map-3d-label-text", a && f.setAttribute("aria-hidden", "true"), l.append(f), e.append(l), {
      element: o,
      node: l,
      glyph: u,
      dot: p,
      leader: g,
      caption: f,
      recipe: d,
      hasGlyph: a,
      priority: c,
      anchor: n.get(o.id)
    };
  });
  return {
    symbols(o) {
      for (const a of i) {
        const r = es(a.element.icon);
        if (r) {
          const c = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          c.setAttribute("viewBox", "0 0 24 24"), c.setAttribute("aria-hidden", "true");
          const h = document.createElementNS(c.namespaceURI, "path");
          h.setAttribute("d", r.path), h.setAttribute("fill", "currentColor"), h.setAttribute("fill-opacity", ".35"), h.setAttribute("stroke", "currentColor"), h.setAttribute("stroke-width", "1.2"), h.setAttribute("stroke-linejoin", "round"), c.append(h), a.glyph.replaceChildren(c);
          continue;
        }
        a.glyph.textContent = o ? a.recipe.icon : a.recipe.fallback, a.glyph.classList.toggle("has-symbols", o);
      }
    },
    update(o, a, r, c) {
      const h = [];
      for (const { element: p, node: g, caption: f, glyph: M, anchor: T, hasGlyph: b, priority: m } of i) {
        g.style.visibility = "hidden", f.hidden = !c;
        const y = T.clone().project(o), _ = (y.x + 1) * a / 2, x = (1 - y.y) * r / 2, w = s?.get(p.id)?.clone().project(o);
        y.z < -1 || y.z > 1 || _ < 0 || _ > a || x < 0 || x > r || h.push({
          id: p.id,
          anchor: {
            x: _,
            y: x
          },
          priority: m,
          badgeAnchor: w ? {
            x: (w.x + 1) * a / 2,
            y: (1 - w.y) * r / 2
          } : void 0,
          badge: b ? {
            w: M.offsetWidth,
            h: M.offsetHeight
          } : void 0,
          caption: c ? {
            w: f.offsetWidth,
            h: f.offsetHeight
          } : void 0
        });
      }
      const l = e.parentElement?.querySelector(".map-viewport-controls")?.getBoundingClientRect(), d = e.getBoundingClientRect(), u = Rn(h, a, r, l ? [{
        x: l.x - d.x,
        y: l.y - d.y,
        w: l.width,
        h: l.height
      }] : []);
      for (const { element: p, node: g, caption: f, dot: M, leader: T } of i) {
        const b = u.get(p.id), m = b?.badge || b?.caption;
        if (f.style.visibility = b?.caption ? "inherit" : "hidden", !(!b || !m) && (g.style.visibility = "visible", g.style.transform = `translate(${m.x}px, ${m.y}px)`, g.style.width = `${m.w}px`, g.style.height = `${m.h}px`, b.caption && (f.style.left = `${b.caption.x - m.x}px`, f.style.top = `${b.caption.y - m.y}px`), b.badge)) {
          const y = b.anchor.x - m.x, _ = b.anchor.y - m.y;
          M.style.transform = `translate(${y}px, ${_}px)`;
          const x = Math.max(0, Math.min(m.w, y)), w = Math.max(0, Math.min(m.h, _));
          T.style.width = `${Math.hypot(x - y, w - _)}px`, T.style.transform = `translate(${y}px, ${_}px) rotate(${Math.atan2(w - _, x - y)}rad)`;
        }
      }
    },
    dispose() {
      for (const { node: o } of i) o.remove();
    }
  };
}
var Ln = class extends ms {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Cn(t);
    }), this.register(function(t) {
      return new In(t);
    }), this.register(function(t) {
      return new Kn(t);
    }), this.register(function(t) {
      return new Vn(t);
    }), this.register(function(t) {
      return new Xn(t);
    }), this.register(function(t) {
      return new Fn(t);
    }), this.register(function(t) {
      return new Un(t);
    }), this.register(function(t) {
      return new zn(t);
    }), this.register(function(t) {
      return new jn(t);
    }), this.register(function(t) {
      return new kn(t);
    }), this.register(function(t) {
      return new Gn(t);
    }), this.register(function(t) {
      return new Dn(t);
    }), this.register(function(t) {
      return new Bn(t);
    }), this.register(function(t) {
      return new Hn(t);
    }), this.register(function(t) {
      return new On(t);
    }), this.register(function(t) {
      return new Yn(t);
    }), this.register(function(t) {
      return new Wn(t);
    });
  }
  load(e, t, n, s) {
    const i = this;
    let o;
    if (this.resourcePath !== "") o = this.resourcePath;
    else if (this.path !== "") {
      const c = Te.extractUrlBase(e);
      o = Te.resolveURL(c, this.path);
    } else o = Te.extractUrlBase(e);
    this.manager.itemStart(e);
    const a = function(c) {
      s ? s(c) : console.error(c), i.manager.itemError(e), i.manager.itemEnd(e);
    }, r = new xt(this.manager);
    r.setPath(this.path), r.setResponseType("arraybuffer"), r.setRequestHeader(this.requestHeader), r.setWithCredentials(this.withCredentials), r.load(e, function(c) {
      try {
        i.parse(c, o, function(h) {
          t(h), i.manager.itemEnd(e);
        }, a);
      } catch (h) {
        a(h);
      }
    }, n, a);
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
  parse(e, t, n, s) {
    let i;
    const o = {}, a = {}, r = new TextDecoder();
    if (typeof e == "string") i = JSON.parse(e);
    else if (e instanceof ArrayBuffer) if (r.decode(new Uint8Array(e, 0, 4)) === Ot) {
      try {
        o[N.KHR_BINARY_GLTF] = new Zn(e);
      } catch (h) {
        s && s(h);
        return;
      }
      i = JSON.parse(o[N.KHR_BINARY_GLTF].content);
    } else i = JSON.parse(r.decode(e));
    else i = e;
    if (i.asset === void 0 || i.asset.version[0] < 2) {
      s && s(/* @__PURE__ */ new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const c = new co(i, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    c.fileLoader.setRequestHeader(this.requestHeader);
    for (let h = 0; h < this.pluginCallbacks.length; h++) {
      const l = this.pluginCallbacks[h](c);
      l.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), a[l.name] = l, o[l.name] = !0;
    }
    if (i.extensionsUsed) for (let h = 0; h < i.extensionsUsed.length; ++h) {
      const l = i.extensionsUsed[h], d = i.extensionsRequired || [];
      switch (l) {
        case N.KHR_MATERIALS_UNLIT:
          o[l] = new Nn();
          break;
        case N.KHR_DRACO_MESH_COMPRESSION:
          o[l] = new qn(i, this.dracoLoader);
          break;
        case N.KHR_TEXTURE_TRANSFORM:
          o[l] = new $n();
          break;
        case N.KHR_MESH_QUANTIZATION:
          o[l] = new Qn();
          break;
        default:
          d.indexOf(l) >= 0 && a[l] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + l + '".');
      }
    }
    c.setExtensions(o), c.setPlugins(a), c.parse(n, s);
  }
  parseAsync(e, t) {
    const n = this;
    return new Promise(function(s, i) {
      n.parse(e, t, s, i);
    });
  }
};
function Pn() {
  let e = {};
  return {
    get: function(t) {
      return e[t];
    },
    add: function(t, n) {
      e[t] = n;
    },
    remove: function(t) {
      delete e[t];
    },
    removeAll: function() {
      e = {};
    }
  };
}
var N = {
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
}, On = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_LIGHTS_PUNCTUAL, this.cache = {
      refs: {},
      uses: {}
    };
  }
  _markDefs() {
    const e = this.parser, t = this.parser.json.nodes || [];
    for (let n = 0, s = t.length; n < s; n++) {
      const i = t[n];
      i.extensions && i.extensions[this.name] && i.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, i.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const t = this.parser, n = "light:" + e;
    let s = t.cache.get(n);
    if (s) return s;
    const i = t.json, o = ((i.extensions && i.extensions[this.name] || {}).lights || [])[e];
    let a;
    const r = new se(16777215);
    o.color !== void 0 && r.setRGB(o.color[0], o.color[1], o.color[2], re);
    const c = o.range !== void 0 ? o.range : 0;
    switch (o.type) {
      case "directional":
        a = new ze(r), a.target.position.set(0, 0, -1), a.add(a.target);
        break;
      case "point":
        a = new Ze(r), a.distance = c;
        break;
      case "spot":
        a = new Ms(r), a.distance = c, o.spot = o.spot || {}, o.spot.innerConeAngle = o.spot.innerConeAngle !== void 0 ? o.spot.innerConeAngle : 0, o.spot.outerConeAngle = o.spot.outerConeAngle !== void 0 ? o.spot.outerConeAngle : Math.PI / 4, a.angle = o.spot.outerConeAngle, a.penumbra = 1 - o.spot.innerConeAngle / o.spot.outerConeAngle, a.target.position.set(0, 0, -1), a.add(a.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + o.type);
    }
    return a.position.set(0, 0, 0), te(a, o), o.intensity !== void 0 && (a.intensity = o.intensity), a.name = t.createUniqueName(o.name || "light_" + e), s = Promise.resolve(a), t.cache.add(n, s), s;
  }
  getDependency(e, t) {
    if (e === "light")
      return this._loadLight(t);
  }
  createNodeAttachment(e) {
    const t = this, n = this.parser, s = n.json.nodes[e], i = (s.extensions && s.extensions[this.name] || {}).light;
    return i === void 0 ? null : this._loadLight(i).then(function(o) {
      return n._getNodeRef(t.cache, i, o);
    });
  }
}, Nn = class {
  constructor() {
    this.name = N.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return ge;
  }
  extendParams(e, t, n) {
    const s = [];
    e.color = new se(1, 1, 1), e.opacity = 1;
    const i = t.pbrMetallicRoughness;
    if (i) {
      if (Array.isArray(i.baseColorFactor)) {
        const o = i.baseColorFactor;
        e.color.setRGB(o[0], o[1], o[2], re), e.opacity = o[3];
      }
      i.baseColorTexture !== void 0 && s.push(n.assignTexture(e, "map", i.baseColorTexture, ce));
    }
    return Promise.all(s);
  }
}, kn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const n = this.parser.json.materials[e];
    if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
    const s = n.extensions[this.name].emissiveStrength;
    return s !== void 0 && (t.emissiveIntensity = s), Promise.resolve();
  }
}, Cn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    if (o.clearcoatFactor !== void 0 && (t.clearcoat = o.clearcoatFactor), o.clearcoatTexture !== void 0 && i.push(n.assignTexture(t, "clearcoatMap", o.clearcoatTexture)), o.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = o.clearcoatRoughnessFactor), o.clearcoatRoughnessTexture !== void 0 && i.push(n.assignTexture(t, "clearcoatRoughnessMap", o.clearcoatRoughnessTexture)), o.clearcoatNormalTexture !== void 0 && (i.push(n.assignTexture(t, "clearcoatNormalMap", o.clearcoatNormalTexture)), o.clearcoatNormalTexture.scale !== void 0)) {
      const a = o.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new B(a, a);
    }
    return Promise.all(i);
  }
}, In = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser.json.materials[e];
    if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
    const s = n.extensions[this.name];
    return t.dispersion = s.dispersion !== void 0 ? s.dispersion : 0, Promise.resolve();
  }
}, Dn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    return o.iridescenceFactor !== void 0 && (t.iridescence = o.iridescenceFactor), o.iridescenceTexture !== void 0 && i.push(n.assignTexture(t, "iridescenceMap", o.iridescenceTexture)), o.iridescenceIor !== void 0 && (t.iridescenceIOR = o.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), o.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = o.iridescenceThicknessMinimum), o.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = o.iridescenceThicknessMaximum), o.iridescenceThicknessTexture !== void 0 && i.push(n.assignTexture(t, "iridescenceThicknessMap", o.iridescenceThicknessTexture)), Promise.all(i);
  }
}, Fn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [];
    t.sheenColor = new se(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const o = s.extensions[this.name];
    if (o.sheenColorFactor !== void 0) {
      const a = o.sheenColorFactor;
      t.sheenColor.setRGB(a[0], a[1], a[2], re);
    }
    return o.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = o.sheenRoughnessFactor), o.sheenColorTexture !== void 0 && i.push(n.assignTexture(t, "sheenColorMap", o.sheenColorTexture, ce)), o.sheenRoughnessTexture !== void 0 && i.push(n.assignTexture(t, "sheenRoughnessMap", o.sheenRoughnessTexture)), Promise.all(i);
  }
}, Un = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    return o.transmissionFactor !== void 0 && (t.transmission = o.transmissionFactor), o.transmissionTexture !== void 0 && i.push(n.assignTexture(t, "transmissionMap", o.transmissionTexture)), Promise.all(i);
  }
}, zn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    t.thickness = o.thicknessFactor !== void 0 ? o.thicknessFactor : 0, o.thicknessTexture !== void 0 && i.push(n.assignTexture(t, "thicknessMap", o.thicknessTexture)), t.attenuationDistance = o.attenuationDistance || 1 / 0;
    const a = o.attenuationColor || [
      1,
      1,
      1
    ];
    return t.attenuationColor = new se().setRGB(a[0], a[1], a[2], re), Promise.all(i);
  }
}, jn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser.json.materials[e];
    if (!n.extensions || !n.extensions[this.name]) return Promise.resolve();
    const s = n.extensions[this.name];
    return t.ior = s.ior !== void 0 ? s.ior : 1.5, Promise.resolve();
  }
}, Gn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    t.specularIntensity = o.specularFactor !== void 0 ? o.specularFactor : 1, o.specularTexture !== void 0 && i.push(n.assignTexture(t, "specularIntensityMap", o.specularTexture));
    const a = o.specularColorFactor || [
      1,
      1,
      1
    ];
    return t.specularColor = new se().setRGB(a[0], a[1], a[2], re), o.specularColorTexture !== void 0 && i.push(n.assignTexture(t, "specularColorMap", o.specularColorTexture, ce)), Promise.all(i);
  }
}, Hn = class {
  constructor(e) {
    this.parser = e, this.name = N.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    return t.bumpScale = o.bumpFactor !== void 0 ? o.bumpFactor : 1, o.bumpTexture !== void 0 && i.push(n.assignTexture(t, "bumpMap", o.bumpTexture)), Promise.all(i);
  }
}, Bn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const t = this.parser.json.materials[e];
    return !t.extensions || !t.extensions[this.name] ? null : ee;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, s = n.json.materials[e];
    if (!s.extensions || !s.extensions[this.name]) return Promise.resolve();
    const i = [], o = s.extensions[this.name];
    return o.anisotropyStrength !== void 0 && (t.anisotropy = o.anisotropyStrength), o.anisotropyRotation !== void 0 && (t.anisotropyRotation = o.anisotropyRotation), o.anisotropyTexture !== void 0 && i.push(n.assignTexture(t, "anisotropyMap", o.anisotropyTexture)), Promise.all(i);
  }
}, Kn = class {
  constructor(e) {
    this.parser = e, this.name = N.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const t = this.parser, n = t.json, s = n.textures[e];
    if (!s.extensions || !s.extensions[this.name]) return null;
    const i = s.extensions[this.name], o = t.options.ktx2Loader;
    if (!o) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return t.loadTextureImage(e, i.source, o);
  }
}, Vn = class {
  constructor(e) {
    this.parser = e, this.name = N.EXT_TEXTURE_WEBP;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t]) return null;
    const o = i.extensions[t], a = s.images[o.source];
    let r = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (r = c);
    }
    return n.loadTextureImage(e, o.source, r);
  }
}, Xn = class {
  constructor(e) {
    this.parser = e, this.name = N.EXT_TEXTURE_AVIF;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, s = n.json, i = s.textures[e];
    if (!i.extensions || !i.extensions[t]) return null;
    const o = i.extensions[t], a = s.images[o.source];
    let r = n.textureLoader;
    if (a.uri) {
      const c = n.options.manager.getHandler(a.uri);
      c !== null && (r = c);
    }
    return n.loadTextureImage(e, o.source, r);
  }
}, Yn = class {
  constructor(e) {
    this.name = N.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const t = this.parser.json, n = t.bufferViews[e];
    if (n.extensions && n.extensions[this.name]) {
      const s = n.extensions[this.name], i = this.parser.getDependency("buffer", s.buffer), o = this.parser.options.meshoptDecoder;
      if (!o || !o.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0) throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return i.then(function(a) {
        const r = s.byteOffset || 0, c = s.byteLength || 0, h = s.count, l = s.byteStride, d = new Uint8Array(a, r, c);
        return o.decodeGltfBufferAsync ? o.decodeGltfBufferAsync(h, l, d, s.mode, s.filter).then(function(u) {
          return u.buffer;
        }) : o.ready.then(function() {
          const u = new ArrayBuffer(h * l);
          return o.decodeGltfBuffer(new Uint8Array(u), h, l, d, s.mode, s.filter), u;
        });
      });
    } else return null;
  }
}, Wn = class {
  constructor(e) {
    this.name = N.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0) return null;
    const s = t.meshes[n.mesh];
    for (const r of s.primitives) if (r.mode !== Q.TRIANGLES && r.mode !== Q.TRIANGLE_STRIP && r.mode !== Q.TRIANGLE_FAN && r.mode !== void 0) return null;
    const i = n.extensions[this.name].attributes, o = [], a = {};
    for (const r in i) o.push(this.parser.getDependency("accessor", i[r]).then((c) => (a[r] = c, a[r])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((r) => {
      const c = r.pop(), h = c.isGroup ? c.children : [c], l = r[0].count, d = [];
      for (const u of h) {
        const p = new Z(), g = new E(), f = new xe(), M = new E(1, 1, 1), T = new ne(u.geometry, u.material, l);
        for (let b = 0; b < l; b++)
          a.TRANSLATION && g.fromBufferAttribute(a.TRANSLATION, b), a.ROTATION && f.fromBufferAttribute(a.ROTATION, b), a.SCALE && M.fromBufferAttribute(a.SCALE, b), T.setMatrixAt(b, p.compose(g, f, M));
        for (const b in a) if (b === "_COLOR_0") {
          const m = a[b];
          T.instanceColor = new ss(m.array, m.itemSize, m.normalized);
        } else b !== "TRANSLATION" && b !== "ROTATION" && b !== "SCALE" && u.geometry.setAttribute(b, a[b]);
        We.prototype.copy.call(T, u), this.parser.assignFinalMaterial(T), d.push(T);
      }
      return c.isGroup ? (c.clear(), c.add(...d), c) : d[0];
    }));
  }
}, Ot = "glTF", _e = 12, ut = {
  JSON: 1313821514,
  BIN: 5130562
}, Zn = class {
  constructor(e) {
    this.name = N.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, _e), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== Ot) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const s = this.header.length - _e, i = new DataView(e, _e);
    let o = 0;
    for (; o < s; ) {
      const a = i.getUint32(o, !0);
      o += 4;
      const r = i.getUint32(o, !0);
      if (o += 4, r === ut.JSON) {
        const c = new Uint8Array(e, _e + o, a);
        this.content = n.decode(c);
      } else if (r === ut.BIN) {
        const c = _e + o;
        this.body = e.slice(c, c + a);
      }
      o += a;
    }
    if (this.content === null) throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}, qn = class {
  constructor(e, t) {
    if (!t) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = N.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, s = this.dracoLoader, i = e.extensions[this.name].bufferView, o = e.extensions[this.name].attributes, a = {}, r = {}, c = {};
    for (const h in o) {
      const l = Ge[h] || h.toLowerCase();
      a[l] = o[h];
    }
    for (const h in e.attributes) {
      const l = Ge[h] || h.toLowerCase();
      if (o[h] !== void 0) {
        const d = n.accessors[e.attributes[h]];
        c[l] = we[d.componentType].name, r[l] = d.normalized === !0;
      }
    }
    return t.getDependency("bufferView", i).then(function(h) {
      return new Promise(function(l, d) {
        s.decodeDracoFile(h, function(u) {
          for (const p in u.attributes) {
            const g = u.attributes[p], f = r[p];
            f !== void 0 && (g.normalized = f);
          }
          l(u);
        }, a, c, re, d);
      });
    });
  }
}, $n = class {
  constructor() {
    this.name = N.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}, Qn = class {
  constructor() {
    this.name = N.KHR_MESH_QUANTIZATION;
  }
}, Nt = class extends xs {
  constructor(e, t, n, s) {
    super(e, t, n, s);
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, s = this.valueSize, i = e * s * 3 + s;
    for (let o = 0; o !== s; o++) t[o] = n[i + o];
    return t;
  }
  interpolate_(e, t, n, s) {
    const i = this.resultBuffer, o = this.sampleValues, a = this.valueSize, r = a * 2, c = a * 3, h = s - t, l = (n - t) / h, d = l * l, u = d * l, p = e * c, g = p - c, f = -2 * u + 3 * d, M = u - d, T = 1 - f, b = M - d + l;
    for (let m = 0; m !== a; m++) {
      const y = o[g + m + a], _ = o[g + m + r] * h, x = o[p + m + a], w = o[p + m] * h;
      i[m] = T * y + b * _ + f * x + M * w;
    }
    return i;
  }
}, Jn = new xe(), eo = class extends Nt {
  interpolate_(e, t, n, s) {
    const i = super.interpolate_(e, t, n, s);
    return Jn.fromArray(i).normalize().toArray(i), i;
  }
}, Q = {
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
}, we = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, ft = {
  9728: Ls,
  9729: Le,
  9984: Ts,
  9985: as,
  9986: Ns,
  9987: Be
}, pt = {
  33071: Is,
  33648: Cs,
  10497: qe
}, Ce = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Ge = {
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
}, oe = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, to = {
  CUBICSPLINE: void 0,
  LINEAR: wt,
  STEP: ls
}, Ie = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function so(e) {
  return e.DefaultMaterial === void 0 && (e.DefaultMaterial = new Ae({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: 0
  })), e.DefaultMaterial;
}
function he(e, t, n) {
  for (const s in n.extensions) e[s] === void 0 && (t.userData.gltfExtensions = t.userData.gltfExtensions || {}, t.userData.gltfExtensions[s] = n.extensions[s]);
}
function te(e, t) {
  t.extras !== void 0 && (typeof t.extras == "object" ? Object.assign(e.userData, t.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + t.extras));
}
function no(e, t, n) {
  let s = !1, i = !1, o = !1;
  for (let h = 0, l = t.length; h < l; h++) {
    const d = t[h];
    if (d.POSITION !== void 0 && (s = !0), d.NORMAL !== void 0 && (i = !0), d.COLOR_0 !== void 0 && (o = !0), s && i && o) break;
  }
  if (!s && !i && !o) return Promise.resolve(e);
  const a = [], r = [], c = [];
  for (let h = 0, l = t.length; h < l; h++) {
    const d = t[h];
    if (s) {
      const u = d.POSITION !== void 0 ? n.getDependency("accessor", d.POSITION) : e.attributes.position;
      a.push(u);
    }
    if (i) {
      const u = d.NORMAL !== void 0 ? n.getDependency("accessor", d.NORMAL) : e.attributes.normal;
      r.push(u);
    }
    if (o) {
      const u = d.COLOR_0 !== void 0 ? n.getDependency("accessor", d.COLOR_0) : e.attributes.color;
      c.push(u);
    }
  }
  return Promise.all([
    Promise.all(a),
    Promise.all(r),
    Promise.all(c)
  ]).then(function(h) {
    const l = h[0], d = h[1], u = h[2];
    return s && (e.morphAttributes.position = l), i && (e.morphAttributes.normal = d), o && (e.morphAttributes.color = u), e.morphTargetsRelative = !0, e;
  });
}
function oo(e, t) {
  if (e.updateMorphTargets(), t.weights !== void 0) for (let n = 0, s = t.weights.length; n < s; n++) e.morphTargetInfluences[n] = t.weights[n];
  if (t.extras && Array.isArray(t.extras.targetNames)) {
    const n = t.extras.targetNames;
    if (e.morphTargetInfluences.length === n.length) {
      e.morphTargetDictionary = {};
      for (let s = 0, i = n.length; s < i; s++) e.morphTargetDictionary[n[s]] = s;
    } else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function io(e) {
  let t;
  const n = e.extensions && e.extensions[N.KHR_DRACO_MESH_COMPRESSION];
  if (n ? t = "draco:" + n.bufferView + ":" + n.indices + ":" + De(n.attributes) : t = e.indices + ":" + De(e.attributes) + ":" + e.mode, e.targets !== void 0) for (let s = 0, i = e.targets.length; s < i; s++) t += ":" + De(e.targets[s]);
  return t;
}
function De(e) {
  let t = "";
  const n = Object.keys(e).sort();
  for (let s = 0, i = n.length; s < i; s++) t += n[s] + ":" + e[n[s]] + ";";
  return t;
}
function He(e) {
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
function ao(e) {
  return e.search(/\.jpe?g($|\?)/i) > 0 || e.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : e.search(/\.webp($|\?)/i) > 0 || e.search(/^data\:image\/webp/) === 0 ? "image/webp" : e.search(/\.ktx2($|\?)/i) > 0 || e.search(/^data\:image\/ktx2/) === 0 ? "image/ktx2" : "image/png";
}
var ro = new Z(), co = class {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new Pn(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = {
      refs: {},
      uses: {}
    }, this.cameraCache = {
      refs: {},
      uses: {}
    }, this.lightCache = {
      refs: {},
      uses: {}
    }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, s = -1, i = !1, o = -1;
    if (typeof navigator < "u") {
      const a = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(a) === !0;
      const r = a.match(/Version\/(\d+)/);
      s = n && r ? parseInt(r[1], 10) : -1, i = a.indexOf("Firefox") > -1, o = i ? a.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && s < 17 || i && o < 98 ? this.textureLoader = new us(this.options.manager) : this.textureLoader = new os(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new xt(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, t) {
    const n = this, s = this.json, i = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(o) {
      return o._markDefs && o._markDefs();
    }), Promise.all(this._invokeAll(function(o) {
      return o.beforeRoot && o.beforeRoot();
    })).then(function() {
      return Promise.all([
        n.getDependencies("scene"),
        n.getDependencies("animation"),
        n.getDependencies("camera")
      ]);
    }).then(function(o) {
      const a = {
        scene: o[0][s.scene || 0],
        scenes: o[0],
        animations: o[1],
        cameras: o[2],
        asset: s.asset,
        parser: n,
        userData: {}
      };
      return he(i, a, s), te(a, s), Promise.all(n._invokeAll(function(r) {
        return r.afterRoot && r.afterRoot(a);
      })).then(function() {
        for (const r of a.scenes) r.updateMatrixWorld();
        e(a);
      });
    }).catch(t);
  }
  _markDefs() {
    const e = this.json.nodes || [], t = this.json.skins || [], n = this.json.meshes || [];
    for (let s = 0, i = t.length; s < i; s++) {
      const o = t[s].joints;
      for (let a = 0, r = o.length; a < r; a++) e[o[a]].isBone = !0;
    }
    for (let s = 0, i = e.length; s < i; s++) {
      const o = e[s];
      o.mesh !== void 0 && (this._addNodeRef(this.meshCache, o.mesh), o.skin !== void 0 && (n[o.mesh].isSkinnedMesh = !0)), o.camera !== void 0 && this._addNodeRef(this.cameraCache, o.camera);
    }
  }
  _addNodeRef(e, t) {
    t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++);
  }
  _getNodeRef(e, t, n) {
    if (e.refs[t] <= 1) return n;
    const s = n.clone(), i = (o, a) => {
      const r = this.associations.get(o);
      r != null && this.associations.set(a, r);
      for (const [c, h] of o.children.entries()) i(h, a.children[c]);
    };
    return i(n, s), s.name += "_instance_" + e.uses[t]++, s;
  }
  _invokeOne(e) {
    const t = Object.values(this.plugins);
    t.push(this);
    for (let n = 0; n < t.length; n++) {
      const s = e(t[n]);
      if (s) return s;
    }
    return null;
  }
  _invokeAll(e) {
    const t = Object.values(this.plugins);
    t.unshift(this);
    const n = [];
    for (let s = 0; s < t.length; s++) {
      const i = e(t[s]);
      i && n.push(i);
    }
    return n;
  }
  getDependency(e, t) {
    const n = e + ":" + t;
    let s = this.cache.get(n);
    if (!s) {
      switch (e) {
        case "scene":
          s = this.loadScene(t);
          break;
        case "node":
          s = this._invokeOne(function(i) {
            return i.loadNode && i.loadNode(t);
          });
          break;
        case "mesh":
          s = this._invokeOne(function(i) {
            return i.loadMesh && i.loadMesh(t);
          });
          break;
        case "accessor":
          s = this.loadAccessor(t);
          break;
        case "bufferView":
          s = this._invokeOne(function(i) {
            return i.loadBufferView && i.loadBufferView(t);
          });
          break;
        case "buffer":
          s = this.loadBuffer(t);
          break;
        case "material":
          s = this._invokeOne(function(i) {
            return i.loadMaterial && i.loadMaterial(t);
          });
          break;
        case "texture":
          s = this._invokeOne(function(i) {
            return i.loadTexture && i.loadTexture(t);
          });
          break;
        case "skin":
          s = this.loadSkin(t);
          break;
        case "animation":
          s = this._invokeOne(function(i) {
            return i.loadAnimation && i.loadAnimation(t);
          });
          break;
        case "camera":
          s = this.loadCamera(t);
          break;
        default:
          if (s = this._invokeOne(function(i) {
            return i != this && i.getDependency && i.getDependency(e, t);
          }), !s) throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(n, s);
    }
    return s;
  }
  getDependencies(e) {
    let t = this.cache.get(e);
    if (!t) {
      const n = this, s = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      t = Promise.all(s.map(function(i, o) {
        return n.getDependency(e, o);
      })), this.cache.add(e, t);
    }
    return t;
  }
  loadBuffer(e) {
    const t = this.json.buffers[e], n = this.fileLoader;
    if (t.type && t.type !== "arraybuffer") throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
    if (t.uri === void 0 && e === 0) return Promise.resolve(this.extensions[N.KHR_BINARY_GLTF].body);
    const s = this.options;
    return new Promise(function(i, o) {
      n.load(Te.resolveURL(t.uri, s.path), i, void 0, function() {
        o(/* @__PURE__ */ new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'));
      });
    });
  }
  loadBufferView(e) {
    const t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function(n) {
      const s = t.byteLength || 0, i = t.byteOffset || 0;
      return n.slice(i, i + s);
    });
  }
  loadAccessor(e) {
    const t = this, n = this.json, s = this.json.accessors[e];
    if (s.bufferView === void 0 && s.sparse === void 0) {
      const o = Ce[s.type], a = we[s.componentType], r = s.normalized === !0, c = new a(s.count * o);
      return Promise.resolve(new Ne(c, o, r));
    }
    const i = [];
    return s.bufferView !== void 0 ? i.push(this.getDependency("bufferView", s.bufferView)) : i.push(null), s.sparse !== void 0 && (i.push(this.getDependency("bufferView", s.sparse.indices.bufferView)), i.push(this.getDependency("bufferView", s.sparse.values.bufferView))), Promise.all(i).then(function(o) {
      const a = o[0], r = Ce[s.type], c = we[s.componentType], h = c.BYTES_PER_ELEMENT, l = h * r, d = s.byteOffset || 0, u = s.bufferView !== void 0 ? n.bufferViews[s.bufferView].byteStride : void 0, p = s.normalized === !0;
      let g, f;
      if (u && u !== l) {
        const M = Math.floor(d / u), T = "InterleavedBuffer:" + s.bufferView + ":" + s.componentType + ":" + M + ":" + s.count;
        let b = t.cache.get(T);
        b || (g = new c(a, M * u, s.count * u / h), b = new Ss(g, u / h), t.cache.add(T, b)), f = new ts(b, r, d % u / h, p);
      } else
        a === null ? g = new c(s.count * r) : g = new c(a, d, s.count * r), f = new Ne(g, r, p);
      if (s.sparse !== void 0) {
        const M = Ce.SCALAR, T = we[s.sparse.indices.componentType], b = s.sparse.indices.byteOffset || 0, m = s.sparse.values.byteOffset || 0, y = new T(o[1], b, s.sparse.count * M), _ = new c(o[2], m, s.sparse.count * r);
        a !== null && (f = new Ne(f.array.slice(), f.itemSize, f.normalized)), f.normalized = !1;
        for (let x = 0, w = y.length; x < w; x++) {
          const O = y[x];
          if (f.setX(O, _[x * r]), r >= 2 && f.setY(O, _[x * r + 1]), r >= 3 && f.setZ(O, _[x * r + 2]), r >= 4 && f.setW(O, _[x * r + 3]), r >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        f.normalized = p;
      }
      return f;
    });
  }
  loadTexture(e) {
    const t = this.json, n = this.options, s = t.textures[e].source, i = t.images[s];
    let o = this.textureLoader;
    if (i.uri) {
      const a = n.manager.getHandler(i.uri);
      a !== null && (o = a);
    }
    return this.loadTextureImage(e, s, o);
  }
  loadTextureImage(e, t, n) {
    const s = this, i = this.json, o = i.textures[e], a = i.images[t], r = (a.uri || a.bufferView) + ":" + o.sampler;
    if (this.textureCache[r]) return this.textureCache[r];
    const c = this.loadImageSource(t, n).then(function(h) {
      h.flipY = !1, h.name = o.name || a.name || "", h.name === "" && typeof a.uri == "string" && a.uri.startsWith("data:image/") === !1 && (h.name = a.uri);
      const l = (i.samplers || {})[o.sampler] || {};
      return h.magFilter = ft[l.magFilter] || 1006, h.minFilter = ft[l.minFilter] || 1008, h.wrapS = pt[l.wrapS] || 1e3, h.wrapT = pt[l.wrapT] || 1e3, h.generateMipmaps = !h.isCompressedTexture && h.minFilter !== 1003 && h.minFilter !== 1006, s.associations.set(h, { textures: e }), h;
    }).catch(function() {
      return null;
    });
    return this.textureCache[r] = c, c;
  }
  loadImageSource(e, t) {
    const n = this, s = this.json, i = this.options;
    if (this.sourceCache[e] !== void 0) return this.sourceCache[e].then((l) => l.clone());
    const o = s.images[e], a = self.URL || self.webkitURL;
    let r = o.uri || "", c = !1;
    if (o.bufferView !== void 0) r = n.getDependency("bufferView", o.bufferView).then(function(l) {
      c = !0;
      const d = new Blob([l], { type: o.mimeType });
      return r = a.createObjectURL(d), r;
    });
    else if (o.uri === void 0) throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const h = Promise.resolve(r).then(function(l) {
      return new Promise(function(d, u) {
        let p = d;
        t.isImageBitmapLoader === !0 && (p = function(g) {
          const f = new et(g);
          f.needsUpdate = !0, d(f);
        }), t.load(Te.resolveURL(l, i.path), p, void 0, u);
      });
    }).then(function(l) {
      return c === !0 && a.revokeObjectURL(r), te(l, o), l.userData.mimeType = o.mimeType || ao(o.uri), l;
    }).catch(function(l) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", r), l;
    });
    return this.sourceCache[e] = h, h;
  }
  assignTexture(e, t, n, s) {
    const i = this;
    return this.getDependency("texture", n.index).then(function(o) {
      if (!o) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (o = o.clone(), o.channel = n.texCoord), i.extensions[N.KHR_TEXTURE_TRANSFORM]) {
        const a = n.extensions !== void 0 ? n.extensions[N.KHR_TEXTURE_TRANSFORM] : void 0;
        if (a) {
          const r = i.associations.get(o);
          o = i.extensions[N.KHR_TEXTURE_TRANSFORM].extendTexture(o, a), i.associations.set(o, r);
        }
      }
      return s !== void 0 && (o.colorSpace = s), e[t] = o, o;
    });
  }
  assignFinalMaterial(e) {
    const t = e.geometry;
    let n = e.material;
    const s = t.attributes.tangent === void 0, i = t.attributes.color !== void 0, o = t.attributes.normal === void 0;
    if (e.isPoints) {
      const a = "PointsMaterial:" + n.uuid;
      let r = this.cache.get(a);
      r || (r = new ws(), Oe.prototype.copy.call(r, n), r.color.copy(n.color), r.map = n.map, r.sizeAttenuation = !1, this.cache.add(a, r)), n = r;
    } else if (e.isLine) {
      const a = "LineBasicMaterial:" + n.uuid;
      let r = this.cache.get(a);
      r || (r = new rs(), Oe.prototype.copy.call(r, n), r.color.copy(n.color), r.map = n.map, this.cache.add(a, r)), n = r;
    }
    if (s || i || o) {
      let a = "ClonedMaterial:" + n.uuid + ":";
      s && (a += "derivative-tangents:"), i && (a += "vertex-colors:"), o && (a += "flat-shading:");
      let r = this.cache.get(a);
      r || (r = n.clone(), i && (r.vertexColors = !0), o && (r.flatShading = !0), s && (r.normalScale && (r.normalScale.y *= -1), r.clearcoatNormalScale && (r.clearcoatNormalScale.y *= -1)), this.cache.add(a, r), this.associations.set(r, this.associations.get(n))), n = r;
    }
    e.material = n;
  }
  getMaterialType() {
    return Ae;
  }
  loadMaterial(e) {
    const t = this, n = this.json, s = this.extensions, i = n.materials[e];
    let o;
    const a = {}, r = i.extensions || {}, c = [];
    if (r[N.KHR_MATERIALS_UNLIT]) {
      const l = s[N.KHR_MATERIALS_UNLIT];
      o = l.getMaterialType(), c.push(l.extendParams(a, i, t));
    } else {
      const l = i.pbrMetallicRoughness || {};
      if (a.color = new se(1, 1, 1), a.opacity = 1, Array.isArray(l.baseColorFactor)) {
        const d = l.baseColorFactor;
        a.color.setRGB(d[0], d[1], d[2], re), a.opacity = d[3];
      }
      l.baseColorTexture !== void 0 && c.push(t.assignTexture(a, "map", l.baseColorTexture, ce)), a.metalness = l.metallicFactor !== void 0 ? l.metallicFactor : 1, a.roughness = l.roughnessFactor !== void 0 ? l.roughnessFactor : 1, l.metallicRoughnessTexture !== void 0 && (c.push(t.assignTexture(a, "metalnessMap", l.metallicRoughnessTexture)), c.push(t.assignTexture(a, "roughnessMap", l.metallicRoughnessTexture))), o = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e);
      }), c.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, a);
      })));
    }
    i.doubleSided === !0 && (a.side = 2);
    const h = i.alphaMode || Ie.OPAQUE;
    if (h === Ie.BLEND ? (a.transparent = !0, a.depthWrite = !1) : (a.transparent = !1, h === Ie.MASK && (a.alphaTest = i.alphaCutoff !== void 0 ? i.alphaCutoff : 0.5)), i.normalTexture !== void 0 && o !== ge && (c.push(t.assignTexture(a, "normalMap", i.normalTexture)), a.normalScale = new B(1, 1), i.normalTexture.scale !== void 0)) {
      const l = i.normalTexture.scale;
      a.normalScale.set(l, l);
    }
    if (i.occlusionTexture !== void 0 && o !== ge && (c.push(t.assignTexture(a, "aoMap", i.occlusionTexture)), i.occlusionTexture.strength !== void 0 && (a.aoMapIntensity = i.occlusionTexture.strength)), i.emissiveFactor !== void 0 && o !== ge) {
      const l = i.emissiveFactor;
      a.emissive = new se().setRGB(l[0], l[1], l[2], re);
    }
    return i.emissiveTexture !== void 0 && o !== ge && c.push(t.assignTexture(a, "emissiveMap", i.emissiveTexture, ce)), Promise.all(c).then(function() {
      const l = new o(a);
      return i.name && (l.name = i.name), te(l, i), t.associations.set(l, { materials: e }), i.extensions && he(s, l, i), l;
    });
  }
  createUniqueName(e) {
    const t = Ps.sanitizeNodeName(e || "");
    return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t);
  }
  loadGeometries(e) {
    const t = this, n = this.extensions, s = this.primitiveCache;
    function i(a) {
      return n[N.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a, t).then(function(r) {
        return mt(r, a, t);
      });
    }
    const o = [];
    for (let a = 0, r = e.length; a < r; a++) {
      const c = e[a], h = io(c), l = s[h];
      if (l) o.push(l.promise);
      else {
        let d;
        c.extensions && c.extensions[N.KHR_DRACO_MESH_COMPRESSION] ? d = i(c) : d = mt(new Se(), c, t), s[h] = {
          primitive: c,
          promise: d
        }, o.push(d);
      }
    }
    return Promise.all(o);
  }
  loadMesh(e) {
    const t = this, n = this.json, s = this.extensions, i = n.meshes[e], o = i.primitives, a = [];
    for (let r = 0, c = o.length; r < c; r++) {
      const h = o[r].material === void 0 ? so(this.cache) : this.getDependency("material", o[r].material);
      a.push(h);
    }
    return a.push(t.loadGeometries(o)), Promise.all(a).then(function(r) {
      const c = r.slice(0, r.length - 1), h = r[r.length - 1], l = [];
      for (let u = 0, p = h.length; u < p; u++) {
        const g = h[u], f = o[u];
        let M;
        const T = c[u];
        if (f.mode === Q.TRIANGLES || f.mode === Q.TRIANGLE_STRIP || f.mode === Q.TRIANGLE_FAN || f.mode === void 0)
          M = i.isSkinnedMesh === !0 ? new ns(g, T) : new K(g, T), M.isSkinnedMesh === !0 && M.normalizeSkinWeights(), f.mode === Q.TRIANGLE_STRIP ? M.geometry = at(M.geometry, 1) : f.mode === Q.TRIANGLE_FAN && (M.geometry = at(M.geometry, 2));
        else if (f.mode === Q.LINES) M = new js(g, T);
        else if (f.mode === Q.LINE_STRIP) M = new yt(g, T);
        else if (f.mode === Q.LINE_LOOP) M = new ps(g, T);
        else if (f.mode === Q.POINTS) M = new ys(g, T);
        else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + f.mode);
        Object.keys(M.geometry.morphAttributes).length > 0 && oo(M, i), M.name = t.createUniqueName(i.name || "mesh_" + e), te(M, i), f.extensions && he(s, M, f), t.assignFinalMaterial(M), l.push(M);
      }
      for (let u = 0, p = l.length; u < p; u++) t.associations.set(l[u], {
        meshes: e,
        primitives: u
      });
      if (l.length === 1)
        return i.extensions && he(s, l[0], i), l[0];
      const d = new be();
      i.extensions && he(s, d, i), t.associations.set(d, { meshes: e });
      for (let u = 0, p = l.length; u < p; u++) d.add(l[u]);
      return d;
    });
  }
  loadCamera(e) {
    let t;
    const n = this.json.cameras[e], s = n[n.type];
    if (!s) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return n.type === "perspective" ? t = new bs(Re.radToDeg(s.yfov), s.aspectRatio || 1, s.znear || 1, s.zfar || 2e6) : n.type === "orthographic" && (t = new Et(-s.xmag, s.xmag, s.ymag, -s.ymag, s.znear, s.zfar)), n.name && (t.name = this.createUniqueName(n.name)), te(t, n), Promise.resolve(t);
  }
  loadSkin(e) {
    const t = this.json.skins[e], n = [];
    for (let s = 0, i = t.joints.length; s < i; s++) n.push(this._loadNodeShallow(t.joints[s]));
    return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(s) {
      const i = s.pop(), o = s, a = [], r = [];
      for (let c = 0, h = o.length; c < h; c++) {
        const l = o[c];
        if (l) {
          a.push(l);
          const d = new Z();
          i !== null && d.fromArray(i.array, c * 16), r.push(d);
        } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[c]);
      }
      return new is(a, r);
    });
  }
  loadAnimation(e) {
    const t = this.json, n = this, s = t.animations[e], i = s.name ? s.name : "animation_" + e, o = [], a = [], r = [], c = [], h = [];
    for (let l = 0, d = s.channels.length; l < d; l++) {
      const u = s.channels[l], p = s.samplers[u.sampler], g = u.target, f = g.node, M = s.parameters !== void 0 ? s.parameters[p.input] : p.input, T = s.parameters !== void 0 ? s.parameters[p.output] : p.output;
      g.node !== void 0 && (o.push(this.getDependency("node", f)), a.push(this.getDependency("accessor", M)), r.push(this.getDependency("accessor", T)), c.push(p), h.push(g));
    }
    return Promise.all([
      Promise.all(o),
      Promise.all(a),
      Promise.all(r),
      Promise.all(c),
      Promise.all(h)
    ]).then(function(l) {
      const d = l[0], u = l[1], p = l[2], g = l[3], f = l[4], M = [];
      for (let b = 0, m = d.length; b < m; b++) {
        const y = d[b], _ = u[b], x = p[b], w = g[b], O = f[b];
        if (y === void 0) continue;
        y.updateMatrix && y.updateMatrix();
        const k = n._createAnimationTracks(y, _, x, w, O);
        if (k) for (let D = 0; D < k.length; D++) M.push(k[D]);
      }
      const T = new Os(i, void 0, M);
      return te(T, s), T;
    });
  }
  createNodeMesh(e) {
    const t = this.json, n = this, s = t.nodes[e];
    return s.mesh === void 0 ? null : n.getDependency("mesh", s.mesh).then(function(i) {
      const o = n._getNodeRef(n.meshCache, s.mesh, i);
      return s.weights !== void 0 && o.traverse(function(a) {
        if (a.isMesh)
          for (let r = 0, c = s.weights.length; r < c; r++) a.morphTargetInfluences[r] = s.weights[r];
      }), o;
    });
  }
  loadNode(e) {
    const t = this.json, n = this, s = t.nodes[e], i = n._loadNodeShallow(e), o = [], a = s.children || [];
    for (let c = 0, h = a.length; c < h; c++) o.push(n.getDependency("node", a[c]));
    const r = s.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", s.skin);
    return Promise.all([
      i,
      Promise.all(o),
      r
    ]).then(function(c) {
      const h = c[0], l = c[1], d = c[2];
      d !== null && h.traverse(function(u) {
        u.isSkinnedMesh && u.bind(d, ro);
      });
      for (let u = 0, p = l.length; u < p; u++) h.add(l[u]);
      return h;
    });
  }
  _loadNodeShallow(e) {
    const t = this.json, n = this.extensions, s = this;
    if (this.nodeCache[e] !== void 0) return this.nodeCache[e];
    const i = t.nodes[e], o = i.name ? s.createUniqueName(i.name) : "", a = [], r = s._invokeOne(function(c) {
      return c.createNodeMesh && c.createNodeMesh(e);
    });
    return r && a.push(r), i.camera !== void 0 && a.push(s.getDependency("camera", i.camera).then(function(c) {
      return s._getNodeRef(s.cameraCache, i.camera, c);
    })), s._invokeAll(function(c) {
      return c.createNodeAttachment && c.createNodeAttachment(e);
    }).forEach(function(c) {
      a.push(c);
    }), this.nodeCache[e] = Promise.all(a).then(function(c) {
      let h;
      if (i.isBone === !0 ? h = new _s() : c.length > 1 ? h = new be() : c.length === 1 ? h = c[0] : h = new We(), h !== c[0]) for (let l = 0, d = c.length; l < d; l++) h.add(c[l]);
      if (i.name && (h.userData.name = i.name, h.name = o), te(h, i), i.extensions && he(n, h, i), i.matrix !== void 0) {
        const l = new Z();
        l.fromArray(i.matrix), h.applyMatrix4(l);
      } else
        i.translation !== void 0 && h.position.fromArray(i.translation), i.rotation !== void 0 && h.quaternion.fromArray(i.rotation), i.scale !== void 0 && h.scale.fromArray(i.scale);
      if (!s.associations.has(h)) s.associations.set(h, {});
      else if (i.mesh !== void 0 && s.meshCache.refs[i.mesh] > 1) {
        const l = s.associations.get(h);
        s.associations.set(h, { ...l });
      }
      return s.associations.get(h).nodes = e, h;
    }), this.nodeCache[e];
  }
  loadScene(e) {
    const t = this.extensions, n = this.json.scenes[e], s = this, i = new be();
    n.name && (i.name = s.createUniqueName(n.name)), te(i, n), n.extensions && he(t, i, n);
    const o = n.nodes || [], a = [];
    for (let r = 0, c = o.length; r < c; r++) a.push(s.getDependency("node", o[r]));
    return Promise.all(a).then(function(r) {
      for (let h = 0, l = r.length; h < l; h++) i.add(r[h]);
      const c = (h) => {
        const l = /* @__PURE__ */ new Map();
        for (const [d, u] of s.associations) (d instanceof Oe || d instanceof et) && l.set(d, u);
        return h.traverse((d) => {
          const u = s.associations.get(d);
          u != null && l.set(d, u);
        }), l;
      };
      return s.associations = c(i), i;
    });
  }
  _createAnimationTracks(e, t, n, s, i) {
    const o = [], a = e.name ? e.name : e.uuid, r = [];
    oe[i.path] === oe.weights ? e.traverse(function(d) {
      d.morphTargetInfluences && r.push(d.name ? d.name : d.uuid);
    }) : r.push(a);
    let c;
    switch (oe[i.path]) {
      case oe.weights:
        c = st;
        break;
      case oe.rotation:
        c = ot;
        break;
      case oe.translation:
      case oe.scale:
        c = tt;
        break;
      default:
        n.itemSize === 1 ? c = st : c = tt;
        break;
    }
    const h = s.interpolation !== void 0 ? to[s.interpolation] : wt, l = this._getArrayFromAccessor(n);
    for (let d = 0, u = r.length; d < u; d++) {
      const p = new c(r[d] + "." + oe[i.path], t.array, l, h);
      s.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(p), o.push(p);
    }
    return o;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = He(t.constructor), s = new Float32Array(t.length);
      for (let i = 0, o = t.length; i < o; i++) s[i] = t[i] * n;
      t = s;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      return new (this instanceof ot ? eo : Nt)(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
};
function lo(e, t, n) {
  const s = t.attributes, i = new ae();
  if (s.POSITION !== void 0) {
    const r = n.json.accessors[s.POSITION], c = r.min, h = r.max;
    if (c !== void 0 && h !== void 0) {
      if (i.set(new E(c[0], c[1], c[2]), new E(h[0], h[1], h[2])), r.normalized) {
        const l = He(we[r.componentType]);
        i.min.multiplyScalar(l), i.max.multiplyScalar(l);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else return;
  const o = t.targets;
  if (o !== void 0) {
    const r = new E(), c = new E();
    for (let h = 0, l = o.length; h < l; h++) {
      const d = o[h];
      if (d.POSITION !== void 0) {
        const u = n.json.accessors[d.POSITION], p = u.min, g = u.max;
        if (p !== void 0 && g !== void 0) {
          if (c.setX(Math.max(Math.abs(p[0]), Math.abs(g[0]))), c.setY(Math.max(Math.abs(p[1]), Math.abs(g[1]))), c.setZ(Math.max(Math.abs(p[2]), Math.abs(g[2]))), u.normalized) {
            const f = He(we[u.componentType]);
            c.multiplyScalar(f);
          }
          r.max(c);
        } else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    i.expandByVector(r);
  }
  e.boundingBox = i;
  const a = new hs();
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, e.boundingSphere = a;
}
function mt(e, t, n) {
  const s = t.attributes, i = [];
  function o(a, r) {
    return n.getDependency("accessor", a).then(function(c) {
      e.setAttribute(r, c);
    });
  }
  for (const a in s) {
    const r = Ge[a] || a.toLowerCase();
    r in e.attributes || i.push(o(s[a], r));
  }
  if (t.indices !== void 0 && !e.index) {
    const a = n.getDependency("accessor", t.indices).then(function(r) {
      e.setIndex(r);
    });
    i.push(a);
  }
  return nt.workingColorSpace !== "srgb-linear" && "COLOR_0" in s && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${nt.workingColorSpace}" not supported.`), te(e, t), lo(e, t, n), Promise.all(i).then(function() {
    return t.targets !== void 0 ? no(e, t.targets, n) : e;
  });
}
async function ho(e) {
  const { scene: t } = await new Ln().parseAsync(e, ""), n = new At(), s = [], i = new ae().setFromObject(t).getSize(new E());
  let o = 0;
  return t.traverse((a) => {
    if (!(a instanceof K)) return;
    n.own(a.geometry);
    const r = Array.isArray(a.material) ? a.material : [a.material];
    r.forEach((h) => n.own(h)), s.push({
      geometry: a.geometry,
      role: r[0].name
    });
    const c = a.geometry.getAttribute("position");
    for (let h = 0; h < c.count; h++) o = Math.max(o, Math.hypot(c.getX(h), c.getZ(h)));
  }), {
    parts: s,
    size: i,
    radius: o,
    dispose: () => {
      n.dispose(), t.clear();
    }
  };
}
function uo(e, t, n) {
  const s = /* @__PURE__ */ new Map();
  let i = !1, o = !1;
  function a() {
    i || !o || [...s.values()].some((c) => !c.settled) || (o = !1, t());
  }
  function r(c) {
    const h = s.get(c);
    s.delete(c), h?.abort.abort(), h?.asset?.dispose();
  }
  return {
    get: (c) => s.get(c)?.asset,
    sync(c) {
      if (i) return;
      const h = new Set(c);
      for (const l of s.keys()) h.has(l) || r(l);
      for (const l of h) {
        if (s.has(l)) continue;
        const d = {
          abort: new AbortController(),
          settled: !1,
          asset: void 0
        };
        s.set(l, d), e(l, d.abort.signal).then((u) => {
          if (s.get(l) !== d) {
            u.dispose();
            return;
          }
          d.asset = u, d.settled = !0, o = !0, a();
        }, (u) => {
          d.settled = !0, s.get(l) === d && n(l, u), a();
        });
      }
      a();
    },
    dispose() {
      i = !0;
      for (const c of s.keys()) r(c);
    }
  };
}
var fo = "" + new URL("map-assets/table-BYH2YAbI.glb", import.meta.url).href, po = "" + new URL("map-assets/chairRounded-CAXjIAhg.glb", import.meta.url).href, mo = "" + new URL("map-assets/bedSingle-DQi3T5hW.glb", import.meta.url).href, go = "" + new URL("map-assets/bookcaseOpenLow-D5KCefka.glb", import.meta.url).href, bo = "" + new URL("map-assets/tree_oak-BfHnIhp4.glb", import.meta.url).href, yo = "" + new URL("map-assets/stone_largeE-BlCexUuF.glb", import.meta.url).href, wo = "" + new URL("map-assets/stoolBar-K3cU9Dzt.glb", import.meta.url).href, _o = "" + new URL("map-assets/bench-Bgad_ueP.glb", import.meta.url).href, To = "" + new URL("map-assets/loungeSofa-B4ImPSPA.glb", import.meta.url).href, xo = "" + new URL("map-assets/kitchenCabinet-DDG9MLaC.glb", import.meta.url).href, Mo = "" + new URL("map-assets/chest-5wu5Viff.glb", import.meta.url).href, So = "" + new URL("map-assets/barrel-CTYVDd_z.glb", import.meta.url).href, Eo = "" + new URL("map-assets/kitchenStove-RyR0iXNj.glb", import.meta.url).href, vo = "" + new URL("map-assets/kitchenFridge-DWiEo7GA.glb", import.meta.url).href, Ro = "" + new URL("map-assets/kitchenSink-BX1FOFLO.glb", import.meta.url).href, Ao = "" + new URL("map-assets/toilet-Lah8VaC1.glb", import.meta.url).href, Lo = "" + new URL("map-assets/bathtub-CbRYKtGX.glb", import.meta.url).href, Po = "" + new URL("map-assets/sedan-CvNIPylJ.glb", import.meta.url).href, Oo = "" + new URL("map-assets/statue_ring-MbjedqWU.glb", import.meta.url).href, No = "" + new URL("map-assets/tent-canvas-DmLjTNyB.glb", import.meta.url).href, ko = "" + new URL("map-assets/pottedPlant-B8kIu3Qg.glb", import.meta.url).href, Co = "" + new URL("map-assets/lampRoundFloor-DO1FJkPg.glb", import.meta.url).href, Io = {
  table: fo,
  chair: po,
  bed: mo,
  shelf: go,
  tree: bo,
  rock: yo,
  stool: wo,
  bench: _o,
  sofa: To,
  cabinet: xo,
  chest: Mo,
  barrel: So,
  stove: Eo,
  refrigerator: vo,
  sink: Ro,
  toilet: Ao,
  bathtub: Lo,
  car: Po,
  statue: Oo,
  tent: No,
  "potted-plant": ko,
  light: Co
};
function Do(e) {
  const t = Fe(), n = new Fs(t.sky.color, t.ground, t.sky.intensity), s = new ze(t.key.color, t.key.intensity), i = new ze(t.fill.color, t.fill.intensity), o = [];
  s.shadow.mapSize.set(1024, 1024), s.shadow.normalBias = 0.012, s.shadow.bias = -15e-5, s.shadow.radius = 2, e.add(n, s, s.target, i);
  function a() {
    const r = o.pop();
    r.removeFromParent(), r.dispose();
  }
  return {
    update(r, c, h, l) {
      const d = Fe(r.lighting);
      n.color.set(d.sky.color), n.groundColor.set(d.ground), n.intensity = d.sky.intensity, s.color.set(d.key.color), s.intensity = d.key.intensity, s.castShadow = d.shadows, i.color.set(d.fill.color), i.intensity = d.fill.intensity;
      const u = h.getCenter(new E()), p = Math.max(1, h.getSize(new E()).length()), g = r.lighting ? new E(...Wt) : new E(-0.5, 1, 0.5);
      s.position.copy(u).add(g.multiplyScalar(p)), s.target.position.copy(u), i.position.copy(u).add(new E(p, p / 2, -p)), s.updateMatrixWorld(!0), s.target.updateMatrixWorld(!0), s.shadow.updateMatrices(s);
      const f = h.clone().applyMatrix4(s.shadow.camera.matrixWorldInverse);
      Object.assign(s.shadow.camera, {
        left: f.min.x - 0.3,
        right: f.max.x + 0.3,
        top: f.max.y + 0.3,
        bottom: f.min.y - 0.3,
        near: Math.max(0.01, -f.max.z - 1),
        far: -f.min.z + 1
      }), s.shadow.camera.updateProjectionMatrix(), s.shadow.needsUpdate = !0;
      const M = Zt(r);
      for (; o.length > M.length; ) a();
      M.forEach((T, b) => {
        let m = o[b];
        m || (m = new Ze(), o.push(m), e.add(m), m.shadow.mapSize.set(512, 512), m.shadow.normalBias = 0.025, m.shadow.bias = -2e-4, m.shadow.radius = 2, m.shadow.autoUpdate = !1);
        const y = T.radius / c.scale, _ = T.overhead ? Math.max(2.2, y * 0.44) : Math.max(1, l.get(T.id)?.y || 0);
        m.color.set(T.color), m.position.copy(c.point(T.x, T.y, _)), m.distance = Math.hypot(y, _), m.decay = 2, m.intensity = _ * _ * (T.overhead ? 6 : 9), m.castShadow = b < 1, m.shadow.camera.near = 0.08, m.shadow.camera.far = m.distance, m.shadow.camera.updateProjectionMatrix(), m.shadow.needsUpdate = !0;
      });
    },
    invalidateShadows() {
      for (const r of o) r.shadow.needsUpdate = !0;
    },
    dispose() {
      for (; o.length; ) a();
      s.dispose(), s.removeFromParent(), s.target.removeFromParent(), n.removeFromParent(), i.removeFromParent();
    }
  };
}
var Fo = class extends _t {
  constructor() {
    super();
    const e = new Mt();
    e.deleteAttribute("uv");
    const t = new Ae({ side: 1 }), n = new Ae(), s = new Ze(16777215, 900, 28, 2);
    s.position.set(0.418, 16.199, 0.3), this.add(s);
    const i = new K(e, t);
    i.position.set(-0.757, 13.219, 0.717), i.scale.set(31.713, 28.305, 28.591), this.add(i);
    const o = new ne(e, n, 6), a = new We();
    a.position.set(-10.906, 2.009, 1.846), a.rotation.set(0, -0.195, 0), a.scale.set(2.328, 7.905, 4.651), a.updateMatrix(), o.setMatrixAt(0, a.matrix), a.position.set(-5.607, -0.754, -0.758), a.rotation.set(0, 0.994, 0), a.scale.set(1.97, 1.534, 3.955), a.updateMatrix(), o.setMatrixAt(1, a.matrix), a.position.set(6.167, 0.857, 7.803), a.rotation.set(0, 0.561, 0), a.scale.set(3.927, 6.285, 3.687), a.updateMatrix(), o.setMatrixAt(2, a.matrix), a.position.set(-2.017, 0.018, 6.124), a.rotation.set(0, 0.333, 0), a.scale.set(2.002, 4.566, 2.064), a.updateMatrix(), o.setMatrixAt(3, a.matrix), a.position.set(2.291, -0.756, -2.621), a.rotation.set(0, -0.286, 0), a.scale.set(1.546, 1.552, 1.496), a.updateMatrix(), o.setMatrixAt(4, a.matrix), a.position.set(-2.193, -0.369, -5.547), a.rotation.set(0, 0.516, 0), a.scale.set(3.875, 3.487, 2.986), a.updateMatrix(), o.setMatrixAt(5, a.matrix), this.add(o);
    const r = new K(e, me(50));
    r.position.set(-16.116, 14.37, 8.208), r.scale.set(0.1, 2.428, 2.739), this.add(r);
    const c = new K(e, me(50));
    c.position.set(-16.109, 18.021, -8.207), c.scale.set(0.1, 2.425, 2.751), this.add(c);
    const h = new K(e, me(17));
    h.position.set(14.904, 12.198, -1.832), h.scale.set(0.15, 4.265, 6.331), this.add(h);
    const l = new K(e, me(43));
    l.position.set(-0.462, 8.89, 14.52), l.scale.set(4.38, 5.441, 0.088), this.add(l);
    const d = new K(e, me(20));
    d.position.set(3.235, 11.486, -12.541), d.scale.set(2.5, 2, 0.1), this.add(d);
    const u = new K(e, me(100));
    u.position.set(0, 20, 0), u.scale.set(1, 0.1, 1), this.add(u);
  }
  dispose() {
    const e = /* @__PURE__ */ new Set();
    this.traverse((t) => {
      t.isMesh && (e.add(t.geometry), e.add(t.material));
    });
    for (const t of e) t.dispose();
  }
};
function me(e) {
  return new fs({
    color: 0,
    emissive: 16777215,
    emissiveIntensity: e
  });
}
function Uo(e, t) {
  const n = new ks(e), s = new Fo();
  let i;
  try {
    i = n.fromScene(s, 0.06, 0.1, 100, { size: 128 });
  } finally {
    s.dispose(), n.dispose();
  }
  return t.environment = i.texture, {
    update(o) {
      t.environmentIntensity = o?.natural === "night" ? 0.08 : 0.18;
    },
    dispose() {
      t.environment = null, i.dispose();
    }
  };
}
function Bo(e, t, n) {
  let s, i, o, a, r, c, h, l, d, u, p = !1, g = !1, f = !0, M = 0, T = 0, b = 0, m = !0, y = !1, _ = !1, x, w = "", O = "", k = !1, D = 14, H = 14;
  const A = new AbortController(), R = new _t(), S = new Et(-10, 10, 10, -10, 0.01, 1e3), U = new B(), j = Do(R), P = () => !!e.closest(".theme-dark");
  let I = P();
  function C() {
    M && (cancelAnimationFrame(M), M = 0);
  }
  function G() {
    p || (p = !0, C(), A.abort(), l?.disconnect(), d?.disconnect(), u?.disconnect(), o?.dispose(), i?.dispose(), c?.dispose(), a?.dispose(), r?.dispose(), j.dispose(), h?.dispose(), s?.dispose(), s?.forceContextLoss(), s?.domElement.remove(), R.clear());
  }
  function z(L) {
    p || g || (g = !0, C(), n.fallback(L));
  }
  function X() {
    p || g || M || document.hidden || !e.isConnected || !f || T <= 0 || b <= 0 || (M = requestAnimationFrame(() => {
      if (M = 0, !(document.hidden || !e.isConnected || !e.getClientRects().length))
        try {
          k && x && (k = !1, kt(x)), s.getSize(U), (U.x !== T || U.y !== b) && s.setSize(T, b, !1), s.render(R, S), c?.update(S, T, b, m);
        } catch {
          z("三维画面暂不可用，已切换二维。");
        }
    }));
  }
  function q() {
    const [L, v, $, J] = x.viewBox, { frame: W } = a;
    return new ae(W.point(L, v), W.point(L + $, v + J)).union(a.bounds);
  }
  function ue() {
    if (!i || !a) return;
    const L = q(), v = L.getCenter(new E()), $ = Math.max(1, L.getSize(new E()).length());
    i.target.copy(v), S.position.copy(v).add(new E(9, 13, 15).normalize().multiplyScalar($ * 2)), S.near = $ / 1e3, S.far = $ * 6, S.lookAt(v), S.updateMatrixWorld(!0);
    let J = 0, W = 0;
    for (const It of [L.min.x, L.max.x]) for (const Dt of [L.min.y, L.max.y]) for (const Ft of [L.min.z, L.max.z]) {
      const Qe = new E(It, Dt, Ft).applyMatrix4(S.matrixWorldInverse);
      J = Math.max(J, Math.abs(Qe.x)), W = Math.max(W, Math.abs(Qe.y));
    }
    D = J, H = W;
    const le = Math.max(H, D / (T / b || 1)) * 1.09;
    S.top = le, S.bottom = -le, S.left = -le * (T / b || 1), S.right = -S.left, S.zoom = 1, S.updateProjectionMatrix(), i.update(), X();
  }
  function fe() {
    if (p) return;
    const L = e.getBoundingClientRect();
    if (T = L.width, b = L.height, T <= 0 || b <= 0) {
      o?.cancel(), C();
      return;
    }
    S.top = Math.max(H, D / (T / b)) * 1.09, S.bottom = -S.top, S.left = -S.top * T / b, S.right = -S.left, S.updateProjectionMatrix(), X();
  }
  function kt(L) {
    const v = O !== L.key, $ = v ? void 0 : a?.frame;
    c?.dispose(), c = void 0, a?.dispose(), a = void 0, v && (r?.dispose(), r = uo(async (J, W) => {
      const le = await fetch(Io[J], { signal: W });
      if (!le.ok) throw new Error(`HTTP ${le.status}`);
      return ho(await le.arrayBuffer());
    }, () => {
      k = !0, X();
    }, (J, W) => console.warn(`[Map 3D] ${J}: keeping procedural shape`, W))), a = vn(L, I, r, $), O = L.key, R.add(a.group), a.updateWalls(y), c = An(t, L, a.anchors, a.markerTops), c.symbols(_), j.update(L, a.frame, q(), a.anchors), h?.update(L.lighting), v && ue(), r?.sync(L.elements.flatMap((J) => {
      const W = Lt(J);
      return W ? [W] : [];
    }));
  }
  function Ct(L) {
    if (p || g) return;
    const v = JSON.stringify(L);
    v !== w && (w = v, x = L, k = !0, X());
  }
  function Pe(L) {
    S.zoom = Re.clamp(S.zoom * L, 0.4, 6), S.updateProjectionMatrix(), X();
  }
  try {
    s = new As({
      antialias: !0,
      alpha: !0,
      powerPreference: "low-power"
    }), s.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8)), s.setClearColor(0, 0), s.outputColorSpace = ce, s.toneMapping = 7, s.toneMappingExposure = 1.1, s.shadowMap.enabled = !0, s.shadowMap.type = 2, h = Uo(s, R), s.debug.onShaderError = () => z("图形驱动无法绘制三维，已切换二维。");
    const L = s.domElement;
    L.setAttribute("aria-label", "三维场景：左键拖动旋转，Shift + 左键拖动平移，滚轮缩放；单指平移，双指拖动旋转、捏合缩放；方向键旋转，Home 全图"), L.title = "左键拖动旋转 · Shift + 左键拖动平移 · 滚轮缩放", L.setAttribute("role", "group"), L.tabIndex = 0, e.prepend(L), i = new Bs(S, L), o = zt(L, (v) => {
      L.dispatchEvent(new PointerEvent("pointercancel", { pointerId: v }));
    }), i.mouseButtons.RIGHT = null, i.touches = {
      ONE: ie.PAN,
      TWO: ie.DOLLY_ROTATE
    }, i.enableDamping = !1, i.minPolarAngle = 0.08, i.maxPolarAngle = Math.PI * 0.46, i.minZoom = 0.4, i.maxZoom = 6, i.rotateSpeed = 0.65, i.zoomSpeed = 0.8, i.addEventListener("change", X), L.addEventListener("webglcontextlost", (v) => {
      v.preventDefault(), z("图形连接已中断，已切换二维。重新打开地图可重试。");
    }, { signal: A.signal }), L.addEventListener("keydown", (v) => {
      if (!(v.ctrlKey || v.metaKey || v.altKey)) {
        if (v.key === "Home") ue();
        else if (v.key === "+" || v.key === "=") Pe(1.2);
        else if (v.key === "-") Pe(1 / 1.2);
        else if ([
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown"
        ].includes(v.key)) {
          const $ = new Ue().setFromVector3(S.position.clone().sub(i.target));
          $.theta += v.key === "ArrowLeft" ? -0.13 : v.key === "ArrowRight" ? 0.13 : 0, $.phi = Re.clamp($.phi + (v.key === "ArrowUp" ? -0.1 : v.key === "ArrowDown" ? 0.1 : 0), i.minPolarAngle, i.maxPolarAngle), S.position.copy(i.target).add(new E().setFromSpherical($)), i.update(), X();
        } else return;
        v.preventDefault();
      }
    }, { signal: A.signal }), l = new ResizeObserver(() => {
      try {
        fe();
      } catch {
        z("三维画面尺寸调整失败，已切换二维。");
      }
    }), l.observe(e), fe(), d = new IntersectionObserver((v) => {
      f = v[0].isIntersecting, f ? X() : C();
    }), d.observe(e), document.addEventListener("visibilitychange", () => {
      document.hidden ? C() : X();
    }, { signal: A.signal }), u = new MutationObserver(() => {
      const v = P();
      v !== I && (I = v, k = !0, X());
    });
    for (let v = e; v; v = v.parentElement) u.observe(v, {
      attributes: !0,
      attributeFilter: ["class"]
    });
    return {
      dispose: G,
      setScene: Ct,
      fit: ue,
      zoom: Pe,
      labels(v) {
        m = v, X();
      },
      walls(v) {
        y = v, a?.updateWalls(v), j.invalidateShadows(), X();
      },
      symbols(v) {
        _ = v, c?.symbols(v), X();
      }
    };
  } catch (L) {
    throw G(), L;
  }
}
export {
  Bo as createThreeRuntime
};
