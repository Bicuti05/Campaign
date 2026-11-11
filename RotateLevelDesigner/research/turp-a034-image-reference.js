"use strict";
const fs=require('fs'),crypto=require('crypto'),{api,RR}=require('./turp-continue'),{OUT,save}=require('./turp-a034-author');
const input='C:/Users/ADMIN/Downloads/2aOboR5szTYOitGGcKI5AdGudaOmBaw6UGMTooym.jpg',source='C:/Project Folder/TURPLevel/LevelVariants/sources/Level70004.rrdesign.json';
fs.writeFileSync(OUT+'/user-level34-reference.jpg',fs.readFileSync(input),{flag:'wx'});
const d=api.loadDesign(source);d.name='A034 image-supported schematic reference (not original runtime)';
const s=(id,x,y,path,guide)=>({id,x,y,angle:0,path,slideAxis:[0,1],guides:[guide],color:'blue'});
// Pixel evidence supplies topology and direction; authoring coordinates below
// are estimates in the existing source coordinate system, not recovered runtime.
d.sticks.unshift(s('S2',6.1667,-5.125,[[0,0],[0,-5.55],[1.3,-5.55]],{x:6.1667,y:-7.4,angle:90}));
d.sticks.unshift(s('S1',6.1667,-17.625,[[0,0],[0,5.45],[-1.3,5.45]],{x:6.1667,y:-15.5,angle:90}));
d.notes='Research reference only. User image16/10 fills two missing L path topologies. Existing source transforms/custom pin geometry remain incomplete; estimated S1/S2 lengths/Guide positions are not original Unity evidence. Not a qualified delivery.';
save('image-supported-source-reference-r01.rrdesign.json',d);
const level=api.build(d),evidence={image:input,imageSha256:crypto.createHash('sha256').update(fs.readFileSync(input)).digest('hex'),source,sourceSha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex'),pictureToSource:{R1:'R8',R2:'R2',R3:'R5',R4:'R10',R5:'R4',R6:'R3',R7:'R6',R8:'R1',R9:'R7',R10:'R9'},basis:'Matched centers, open/closed ring and directed pin topology in user supplied level34 image, not ordinal filename inference.',recoveredTopology:{S1:'Vertical from imageR5 upward, elbow left; Guide on upright leg',S2:'Vertical from imageR6 downward, elbow right; Guide on upright leg'},notRecovered:['exact lengths/Guide coordinates','source collider/runtime','custom pin note mapping','original solution/feel'],analysis:RR.analyze(level),strict:api.OVL.check(d)};
save('image-source-evidence.json',evidence);console.log(JSON.stringify(evidence.analysis));
