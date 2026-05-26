// ─────────────────────────────────────────────────────────────────────────────
// app.js — Composant principal SaucisseVolante (orchestration de l'UI)
// ─────────────────────────────────────────────────────────────────────────────

import { GRADE_POINTS, GRADES, PALETTE, C } from "./config.js";
import { getInverseWeight, buildSegments, pickWinner } from "./logic.js";
import { useSavedLists } from "./storage.js";
import { h, Label, SaucisseIcon } from "./components.js";
import { TargetCanvas } from "./canvas.js";

const { useState, useRef, useEffect, useCallback } = React;

export function SaucisseVolante() {
  var ss = useState([]); var soldiers=ss[0],setSoldiers=ss[1];
  var sf = useState({name:'',grade:GRADES[0],anciennete:0}); var form=sf[0],setForm=sf[1];
  var sw = useState(null); var winner=sw[0],setWinner=sw[1];
  var sa = useState(false); var animating=sa[0],setAnimating=sa[1];
  var st = useState(''); var task=st[0],setTask=st[1];
  var se = useState(null); var editId=se[0],setEditId=se[1];
  var stab = useState('effectif'); var tab=stab[0],setTab=stab[1];
  var slr = useSavedLists(); var lists=slr.lists,loading=slr.loading,saveList=slr.saveList,deleteList=slr.deleteList;
  var sm = useState(false); var saveModal=sm[0],setSaveModal=sm[1];
  var sn = useState(''); var saveName=sn[0],setSaveName=sn[1];
  var sg = useState(''); var saveMsg=sg[0],setSaveMsg=sg[1];

  var segments = buildSegments(soldiers);
  var totalPts = GRADE_POINTS[form.grade]+Number(form.anciennete);
  var canFire  = soldiers.length>=2&&!animating;

  function addSoldier(){
    if(!form.name.trim())return;
    var tp=GRADE_POINTS[form.grade]+Number(form.anciennete);
    if(editId!==null){
      setSoldiers(soldiers.map(function(s){return s.id===editId?Object.assign({},s,{name:form.name,grade:form.grade,anciennete:Number(form.anciennete),totalPoints:tp}):s;}));
      setEditId(null);
    }else{
      setSoldiers(soldiers.concat([{id:Date.now(),name:form.name,grade:form.grade,anciennete:Number(form.anciennete),totalPoints:tp}]));
    }
    setForm({name:'',grade:GRADES[0],anciennete:0});
  }
  function removeSoldier(id){
    setSoldiers(function(s){return s.filter(function(x){return x.id!==id;});});
    if(winner&&winner.id===id)setWinner(null);
  }
  function startEdit(s){
    setForm({name:s.name,grade:s.grade,anciennete:s.anciennete});
    setEditId(s.id);setTab('effectif');
  }
  function lancerLaSaucisse(){
    if(!canFire)return;
    setWinner(null);setTab('cible');setAnimating(true);
    var w=pickWinner(segments);
    setTimeout(function(){setAnimating(false);setWinner(w);},3300);
  }
  function loadList(lst){
    setSoldiers(lst.soldiers.map(function(s){return Object.assign({},s,{id:Date.now()+Math.random()});}));
    setWinner(null);setTab('effectif');
  }
  function handleSave(){
    if(!saveName.trim())return;
    saveList(saveName.trim(),soldiers).then(function(){
      setSaveMsg('✓ Liste "'+saveName.trim()+'" sauvegardée !');
      setTimeout(function(){setSaveMsg('');setSaveModal(false);setSaveName('');},1800);
    });
  }

  var TABS=[
    {id:'effectif',label:'EFFECTIF ('+soldiers.length+')'},
    {id:'cible',label:'CIBLE'},
    {id:'listes',label:'LISTES ('+lists.length+')'},
  ];

  var IS={width:'100%',background:C.board,border:'1px solid '+C.border,color:C.chalk,fontFamily:"'Courier New',monospace",fontSize:13,padding:'8px 10px',borderRadius:3,outline:'none'};
  var BB={width:'100%',border:'none',borderRadius:3,fontFamily:"'Courier New',monospace",fontWeight:'bold',fontSize:12,letterSpacing:2,padding:'10px',cursor:'pointer',textTransform:'uppercase'};
  var BP=Object.assign({},BB,{background:C.accent,color:C.bgPanel});
  var BA=Object.assign({},BB,{background:'#8B6914',color:C.chalk});
  var BG=Object.assign({},BB,{background:'transparent',border:'1px solid '+C.border,color:C.chalkDim});
  var BI={background:'none',border:'none',color:C.chalkFaint,cursor:'pointer',fontSize:13,padding:'2px 5px',fontFamily:'monospace'};

  var winnerSeg = winner?segments.find(function(s){return s.id===winner.id;}):null;

  return h('div',{style:{minHeight:'100vh',background:C.bg,color:C.chalk,fontFamily:"'Courier New',monospace"}},
    // HEADER
    h('div',{style:{background:C.bgPanel,borderBottom:'2px solid '+C.border,padding:'10px 14px',display:'flex',alignItems:'center',gap:10}},
      h(SaucisseIcon,{size:36}),
      h('div',null,
        h('div',{style:{fontSize:16,fontWeight:'bold',letterSpacing:3,textTransform:'uppercase'}},'La Saucisse Volante'),
        h('div',{style:{fontSize:10,color:C.chalkFaint,letterSpacing:2}},'DÉSIGNATION VOLONTAIRE — USAGE INTERNE')
      ),
      h('div',{style:{marginLeft:'auto',fontSize:11,color:C.chalkDim,background:C.board,border:'1px solid '+C.border,padding:'4px 10px',borderRadius:3}},soldiers.length+' MIL.')
    ),
    // TABS
    h('div',{className:'mobile-tabs',style:{display:'flex',borderBottom:'1px solid '+C.border,background:C.bgPanel}},
      TABS.map(function(t){
        var active=tab===t.id;
        return h('button',{key:t.id,onClick:function(){setTab(t.id);},style:{flex:1,padding:'9px 4px',border:'none',cursor:'pointer',fontFamily:"'Courier New',monospace",fontWeight:'bold',fontSize:10,letterSpacing:1,textTransform:'uppercase',background:active?C.board:'transparent',color:active?C.chalk:C.chalkFaint,borderBottom:active?'2px solid '+C.accent:'2px solid transparent'}},'▸ '+t.label);
      })
    ),
    // LAYOUT
    h('div',{className:'main-layout',style:{display:'flex',minHeight:'calc(100vh - 108px)'}},

      // PANEL EFFECTIF
      h('div',{className:'panel-left'+(tab!=='effectif'?' hidden-mobile':''),style:{flex:'0 0 300px',borderRight:'1px solid '+C.border,background:C.bgPanel,padding:14,display:'flex',flexDirection:'column',gap:14,overflowY:'auto'}},
        h('div',null,
          h(Label,null,'▸ MISSION'),
          h('input',{value:task,onChange:function(ev){setTask(ev.target.value);},placeholder:'Corvée patates, nettoyage cantonnement...',style:IS})
        ),
        h('div',{style:{background:C.board,border:'1px solid '+C.border,borderRadius:4,padding:12}},
          h(Label,null,editId!==null?'✎ MODIFIER':'+  ENREGISTRER'),
          h('div',{style:{display:'flex',flexDirection:'column',gap:7,marginTop:8}},
            h('input',{value:form.name,onChange:function(ev){setForm(Object.assign({},form,{name:ev.target.value}));},placeholder:'Nom Prénom',style:IS,onKeyDown:function(ev){if(ev.key==='Enter')addSoldier();}}),
            h('select',{value:form.grade,onChange:function(ev){setForm(Object.assign({},form,{grade:ev.target.value}));},style:Object.assign({},IS,{cursor:'pointer'})},
              GRADES.map(function(g){return h('option',{key:g,value:g},g+' ('+GRADE_POINTS[g]+'pt)');})
            ),
            h('div',{style:{display:'flex',alignItems:'center',gap:8}},
              h('span',{style:{fontSize:11,color:C.chalkDim,whiteSpace:'nowrap'}},'Ancienneté :'),
              h('input',{type:'number',min:0,max:40,value:form.anciennete,onChange:function(ev){setForm(Object.assign({},form,{anciennete:ev.target.value}));},style:Object.assign({},IS,{width:56,textAlign:'center'})}),
              h('span',{style:{fontSize:11,color:C.chalkDim}},'ans')
            ),
            h('div',{style:{fontSize:11,color:C.chalkFaint}},'Total : ',h('b',{style:{color:C.accent}},totalPts+' pts'),' → poids : ',h('b',{style:{color:C.chalkDim}},getInverseWeight(totalPts))),
            h('button',{onClick:addSoldier,style:editId!==null?BA:BP},editId!==null?'✎ METTRE À JOUR':'+ AJOUTER'),
            editId!==null?h('button',{onClick:function(){setEditId(null);setForm({name:'',grade:GRADES[0],anciennete:0});},style:BG},'ANNULER'):null
          )
        ),
        h('div',{style:{flex:1,overflowY:'auto'}},
          h('div',{style:{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}},
            h(Label,null,'▸ EFFECTIF ('+soldiers.length+')'),
            soldiers.length>=1?h('button',{onClick:function(){setSaveModal(true);setSaveName('');},style:Object.assign({},BG,{width:'auto',padding:'4px 10px',fontSize:10})},'💾 SAUVEGARDER'):null
          ),
          soldiers.length===0?h('div',{style:{color:C.chalkFaint,fontSize:12,fontStyle:'italic'}},'Aucun militaire enregistré.'):null,
          h('div',{style:{display:'flex',flexDirection:'column',gap:4}},
            soldiers.map(function(s,i){
              var seg=segments.find(function(sg){return sg.id===s.id;});
              var col=PALETTE[i%PALETTE.length];
              var isW=winner&&winner.id===s.id;
              return h('div',{key:s.id,style:{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',borderRadius:3,border:'1px solid '+(isW?col:C.border),background:isW?col+'30':C.board,transition:'all 0.3s'}},
                h('div',{style:{width:8,height:8,borderRadius:1,background:col,flexShrink:0}}),
                h('div',{style:{flex:1,minWidth:0}},
                  h('div',{style:{fontSize:12,fontWeight:'bold',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}},(isW?'🌭 ':'')+s.name),
                  h('div',{style:{fontSize:10,color:C.chalkFaint}},s.grade.split(' ').slice(0,2).join(' ')+' · '+s.anciennete+'an · ',h('b',{style:{color:C.chalkDim}},s.totalPoints+'pts'),' · '+(seg?seg.pct:'?')+'%')
                ),
                h('button',{onClick:function(){startEdit(s);},style:BI,title:'Modifier'},'✎'),
                h('button',{onClick:function(){removeSoldier(s.id);},style:Object.assign({},BI,{color:'#cc4444'}),title:'Supprimer'},'✕')
              );
            })
          )
        )
      ),

      // PANEL CIBLE
      h('div',{className:'panel-center'+(tab!=='cible'?' hidden-mobile':''),style:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',padding:'16px 14px',gap:14,overflowY:'auto'}},
        h('div',{style:{width:'100%',maxWidth:370,position:'relative'}},
          h(TargetCanvas,{segments:segments,winner:winner,animating:animating,size:400}),
          animating?h('div',{style:{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'rgba(26,43,26,0.88)',border:'1px solid '+C.chalkFaint,color:C.chalk,fontSize:12,letterSpacing:3,padding:'6px 14px',borderRadius:3,animation:'blink 0.5s step-end infinite',whiteSpace:'nowrap'}},'EN VOL...'):null
        ),
        h('button',{onClick:lancerLaSaucisse,disabled:!canFire,style:{width:'100%',maxWidth:370,padding:'17px 16px',fontSize:16,fontWeight:'bold',fontFamily:"'Courier New',monospace",letterSpacing:3,textTransform:'uppercase',border:'2px solid '+(canFire?C.accent:C.chalkFaint),background:canFire?C.accent+'22':'transparent',color:canFire?C.accent:C.chalkFaint,borderRadius:4,cursor:canFire?'pointer':'not-allowed',transition:'all 0.2s',boxShadow:canFire?'0 0 16px '+C.accent+'44':'none'}},animating?'🌭  EN VOL...':'🌭  LANCER LA SAUCISSE'),
        soldiers.length<2&&!animating?h('div',{style:{fontSize:11,color:C.chalkFaint,letterSpacing:2,textAlign:'center'}},'MINIMUM 2 MILITAIRES REQUIS'):null,
        winner&&!animating?h('div',{style:{width:'100%',maxWidth:370,border:'1px solid '+C.borderLight,background:C.board,borderRadius:4,padding:'16px',textAlign:'center',animation:'fadeIn 0.4s ease'}},
          h('div',{style:{fontSize:10,letterSpacing:4,color:C.chalkFaint,marginBottom:10}},'▸ VOLONTAIRE DÉSIGNÉ D\'OFFICE'),
          h('div',{style:{fontSize:24,fontWeight:'bold',letterSpacing:2,marginBottom:4}},'🌭 '+winner.name),
          h('div',{style:{fontSize:12,color:C.chalkDim,marginBottom:10}},winner.grade+' — '+winner.anciennete+' an'+(winner.anciennete>1?'s':'')+' — '+winner.totalPoints+' pts'),
          task?h('div',{style:{padding:'10px 14px',marginBottom:10,background:'rgba(139,26,26,0.2)',border:'1px solid '+C.red+'88',borderRadius:3,fontSize:14,color:'#D4886A'}},'📋 '+task):null,
          h('div',{style:{fontSize:10,color:C.chalkFaint}},'Probabilité : '+(winnerSeg?winnerSeg.pct:'?')+'%')
        ):null
      ),

      // PANEL LISTES
      h('div',{className:'panel-right'+(tab!=='listes'?' hidden-mobile':''),style:{flex:'0 0 260px',borderLeft:'1px solid '+C.border,background:C.bgPanel,padding:14,display:'flex',flexDirection:'column',gap:12,overflowY:'auto'}},
        h(Label,null,'▸ LISTES SAUVEGARDÉES'),
        loading?h('div',{style:{color:C.chalkFaint,fontSize:12}},'Chargement...'):null,
        !loading&&lists.length===0?h('div',{style:{color:C.chalkFaint,fontSize:12,fontStyle:'italic',lineHeight:1.6}},'Aucune liste sauvegardée. Constitue ton effectif et clique sur 💾 SAUVEGARDER.'):null,
        lists.map(function(lst){
          return h('div',{key:lst.name,style:{background:C.board,border:'1px solid '+C.border,borderRadius:4,padding:12}},
            h('div',{style:{fontWeight:'bold',fontSize:13,marginBottom:3}},lst.name),
            h('div',{style:{fontSize:11,color:C.chalkFaint,marginBottom:8}},lst.soldiers.length+' militaire'+(lst.soldiers.length>1?'s':'')+' · '+lst.savedAt),
            h('div',{style:{fontSize:10,color:C.chalkDim,marginBottom:10,lineHeight:1.8}},lst.soldiers.slice(0,6).map(function(s){return s.name+' ('+s.totalPoints+'pts)';}).join(' · ')+(lst.soldiers.length>6?' · +'+(lst.soldiers.length-6)+' autres':'')),
            h('div',{style:{display:'flex',gap:6}},
              h('button',{onClick:function(){loadList(lst);},style:Object.assign({},BP,{flex:1,fontSize:11,padding:'7px 4px'})},'▶ CHARGER'),
              h('button',{onClick:function(){deleteList(lst.name);},style:Object.assign({},BI,{color:'#cc4444',border:'1px solid #cc444488',padding:'7px 10px',borderRadius:3})},'✕')
            )
          );
        }),
        h('div',{className:'desktop-save',style:{marginTop:'auto'}},
          soldiers.length>=1?h('button',{onClick:function(){setSaveModal(true);setSaveName('');},style:Object.assign({},BG,{fontSize:11})},"💾 SAUVEGARDER L'EFFECTIF ACTUEL"):null
        )
      )
    ),

    // MODAL
    saveModal?h('div',{style:{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}},
      h('div',{style:{background:C.bgPanel,border:'2px solid '+C.border,borderRadius:6,padding:24,width:'90%',maxWidth:360}},
        h('div',{style:{fontWeight:'bold',fontSize:14,letterSpacing:2,marginBottom:16}},'💾 SAUVEGARDER LA LISTE'),
        h('input',{value:saveName,onChange:function(ev){setSaveName(ev.target.value);},placeholder:'Nom de la liste (ex: Section Alpha)',style:Object.assign({},IS,{marginBottom:12}),onKeyDown:function(ev){if(ev.key==='Enter')handleSave();}}),
        saveMsg?h('div',{style:{color:'#6BAF6B',fontSize:12,marginBottom:10}},saveMsg):null,
        h('div',{style:{display:'flex',gap:8}},
          h('button',{onClick:handleSave,style:Object.assign({},BP,{flex:1})},'SAUVEGARDER'),
          h('button',{onClick:function(){setSaveModal(false);},style:Object.assign({},BG,{flex:1})},'ANNULER')
        )
      )
    ):null,

    // CSS
);
}