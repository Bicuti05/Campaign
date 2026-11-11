"use strict";
// Plain-language idea the player has to notice, derived from the pin structure and the role witnesses.
// Starting text for GD; it should be rewritten after playing.
function idea(design, roles) {
  const out = [], inc = {}, outs = {};
  design.rings.forEach(r => r.pins.forEach(p => { (inc[p.target] = inc[p.target] || []).push(r.id); (outs[r.id] = outs[r.id] || []).push(p.target); }));
  const multi = Object.entries(inc).filter(([, s]) => s.length >= 2).sort((a, b) => b[1].length - a[1].length);
  if (multi.length) {
    const [t, s] = multi[0], shared = s.filter(x => (outs[x] || []).length >= 2);
    out.push(`${t} bị ${s.length} vòng (${s.join(", ")}) cùng giữ: một lần quay không nhả hết, phải nhả từng phía`);
    if (shared.length) out.push(`${shared[0]} còn giữ ${outs[shared[0]].filter(x => x !== t).join(", ")}: chưa nhả nơi đó mà quay ${t} tiếp thì pin cắm lại`);
  } else {
    const src = design.rings.find(r => r.pins.length && !inc[r.id]);
    if (src) out.push(`vòng có pin (${src.id}) không quay được: quay vòng bị pin cắm vào cho khe đi qua pin để nhả`);
  }
  const closed = design.rings.filter(r => r.gap === 0);
  if (closed.length) out.push(`vòng kín ${closed.map(r => r.id).join(", ")} không có khe: chỉ rời khi mọi vòng nó giữ đã nhả`);
  (roles.stops || []).forEach(s => out.push(`chốt trên ${s.ring} chặn một chiều quay: chọn chiều hoặc dọn đường trước`));
  (roles.sticks || []).forEach(s => out.push(s.witness && s.witness.blockedAtStart ? `thanh ${s.stick} bị chặn lúc đầu: phải mở đường cho nó trước` : `thanh ${s.stick} chặn đường quay của vòng bên cạnh: rút thanh đúng lúc`));
  return out.slice(0, 4).join("; ") + ".";
}
module.exports = { idea };
