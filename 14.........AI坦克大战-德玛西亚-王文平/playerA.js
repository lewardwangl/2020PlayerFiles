eval(function(p,a,c,k,e,r){e=function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)>35?String.fromCharCode(c+29):c.toString(36))};if('0'.replace(0,e)==0){while(c--)r[e(c)]=k[c];k=[function(e){return r[e]||e}];e=function(){return'([7a-hj-zC-WZ]|[12]\\w)'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('(x(n="A",H="德玛西亚"){7(!["A","B"].includes(n))n="A";a 1w=1g 1x("1V");a 1y=1g 1x("keyup");a 1z=1g 1x("1V");a 1W=[L,0,W,s];a 1A=1g Map([[L,-1],[0,1],[W,1],[s,-1],]);x Z(1h){7(1h<b.1X(10,-6)&&1h>-b.1X(10,-6))d 0;e d 1h}x 1Y(k){j m=[];k=k%1i;7(k>0&&k<L){m=[1,0]}e 7(k>L&&k<s){m=[3,0]}e 7(k>s&&k<W){m=[3,2]}e 7(k>W&&k<1i){m=[1,2]}7(k==0)m.1j(1);7(k==L)m.1j(0);7(k==s)m.1j(3);7(k==W)m.1j(2);d m}x 1Z(h,M,N){7(M==0&&N==0)d O;7(M==0){d N>0?0:2}7(N==0){d M>0?1:3}j P=1;j Q=0;7(M>0)P=1;e P=3;7(N>0)Q=0;e Q=2;a 1B=11(h,P,13);a 20=11(h,Q,13);7(!1B&&!20){7(b.g(M)>b.g(N)){d P}e{d Q}}7(1B){d Q}e{d P}}x 21(1C,1D){a 1E=1C.X-1D.X;a 1F=1C.Y-1D.Y;d b.14(1E*1E+1F*1F)}x 11(h,l,ametals){a y=h.y;var I=typeof I==="x"?I:()=>v;7(l==0&&h.Y-y-E<0&&I(h.X,h.Y-y,R)){d v}e 7(l==1&&h.X+y>screenX-R&&I(h.X+y,h.Y,R)){d v}e 7(l==2&&h.Y+y>screenY-R&&I(h.X,h.Y+y,R)){d v}e 7(l==3&&h.X-y<0&&I(h.X-y,h.Y,R)){d v}d J}x 22(l){7(l===O)d;j w=O;switch(l){1k 0:w=n==="A"?87:38;1l;1k 2:w=n==="A"?83:40;1l;1k 3:w=n==="A"?65:37;1l;1k 1:w=n==="A"?68:39;1l}7(w!==O){1w.w=w;1y.w=w;1m.onkeydown(1w)}}a 15=()=>{1z.w=n==="A"?32:8;1m.dispatchEvent(1z)};a 24=(()=>{j i=0;d()=>{7(i>0)d;1m.getElementById(`Player${n==="B"?2:1}Name`).textContent=H;i++}})();x 16(h,c,26,o){j p=J;a l=h.l;1n(j q of 26){7(q.l===l){7(l===0&&b.g(q.X-h.X)<o&&c.Y<q.Y){p=v;d p}e 7(l===2&&b.g(q.X-h.X)<o&&c.Y>q.Y){p=v;d p}e 7(l===1&&b.g(q.Y-h.Y)<o&&c.X>q.X){p=v;d p}e 7(l===3&&b.g(q.Y-h.Y)<o&&c.X<q.X){p=v;d p}}}d p}window[`player${n}`]={land(){24();a f=27.28((1p)=>1p.id==(n==="A"?2a:1G));a c=27.28((1p)=>1p.id==(n==="A"?1G:2a));7(!f)d H;7(n==="A"&&player1Die)d H;7(n==="B"&&player2Die)d H;j K=1;7(playerNum===2){7(13.D>0){K=3}e{K=2}}a F=K===3?[...2b,c]:2b;7(F.D===0)d H;a G=n==="A"?2c:2d;a 2e=n==="B"?2c:2d;a 1H=2;j z=0;j 1I=0,1J=0,1K=0,1L=0,1M=J,1q=J,isGo2Die=J;j C=F.D;1n(a c of F){7(c===O)2f;a 17=f.l;a o=G.D>=3?E:1G;a t=c.X-f.X;a u=f.Y-c.Y;a 18=b.14(t*t+u*u);j 1a=400;7(K==3)C++;7(C<4){1a=500}e 7(C<9){1a=1000}e 7(C<12){1a=2000}7(18<1a||G.D<3){7(17===0&&c.Y<f.Y&&b.g(c.X-f.X)<o&&!16(f,c,G,o)){15()}e 7(17===2&&c.Y>f.Y&&b.g(c.X-f.X)<o&&!16(f,c,G,o)){15()}e 7(17===1&&c.X>f.X&&b.g(c.Y-f.Y)<o&&!16(f,c,G,o)){15()}e 7(17===3&&c.X<f.X&&b.g(c.Y-f.Y)<o&&!16(f,c,G,o)){15()}}}x 1N(2g){1n(a q of 2g){a t=q.X-f.X-25;a u=f.Y+25-q.Y;a k=1W[q.l];a Bx=Z(b.2h((k/s)*b.PI)*1);a By=Z(b.2i((k/s)*b.PI)*1);a 1Q=t*Bx+u*By;a 1r=t*By-u*Bx;a 18=b.14(t*t+u*u);j 1c=1200;7(K==3)C++;7(C<4){1c=1s}e 7(C<9){1c=600}e 7(C<10){1c=800}7((1Q>0&&b.g(1r)>25&&18<45)||(1Q<0&&b.g(1r)<60&&18<1c)){j p=b.sign(1r);7(p==0)p=b.random()>0.5?1:-1;a m=(p*L+k)%1i;7(b.g(t)>31&&b.g(t)<E&&b.g(u)>31&&b.g(u)<E){7(m==0||m==s){1K+=1A[m]}e{1L+=1A[m]}1M=v}a 1R=40/b.14(t*t+u*u);a 2j=Z(b.2h((m/s)*b.PI));a 2k=Z(b.2i((m/s)*b.PI));1I+=2j*1R;1J+=2k*1R;1q=v}}}1N(aBulletCount);7(K===3){1N(2e)}7(1q){7(1M&&1L==0&&1K==0){z=4}e{z=1Z(f,1I,1J)}}e{j 1t=1S;j 1d=F[0];j S=1S;j 1u=F[0];1n(a c of F){7(c===O)2f;a 1e=21(f,c);7(b.g(c.X-f.X)<E&&1e<1s){T=b.g(c.Y-f.Y);7(T<S){S=T;1u=c}}7(b.g(c.Y-f.Y)<E&&1e<1s){T=b.g(c.X-f.X);7(T<S){S=T;1u=c}}7(1e<1t){1t=1e;1d=c}}7(S!=1S){1d=1u}a U=1d.X-f.X;a V=f.Y-1d.Y;a 1v=b.14(U*U+V*V);j 1f=(b.acos(U/1v)*s)/b.PI;7(V<0){1f=1i-1f}j 1T=J;7((1v<(1H+1.5)*E&&G.D===5)||1v<1H*E){1f+=s;1T=J}a r=1Y(1f);7(r.D>0){7(r.D==1)z=r[0];e{a 1U=11(f,r[0],13);a 2l=11(f,r[1],13);7(1U||2l){z=1U?r[1]:r[0]}e{7(1t>1s&&C>=19){z=r[0]}e{7(1T&&F.D>4){z=b.g(U)>b.g(V)?r[1]:r[0]}e{z=b.g(U)>b.g(V)?r[0]:r[1]}}}}}}7(!1q)console.warn(" mmovee",z);22(z);d H},leave(){1m.onkeyup(1y)},}})("A","德玛西亚");',[],146,'|||||||if|||const|Math|enemyTank|return|else|currentTank|abs|tank||let|degree|direction|tempdir|type|gap|flag|bullet|dir|180|Ax|Ay|true|keyCode|function|speed|moveDirection|||emtankNum|length|50|enemyTanks|myBullets|teamName|collisionMetal|false|level|90|movex|movey|undefined|dir1|dir2|tankWidth|sameXorYDis|diff|TAx|TAy|270|||zero||checkOutOfScreen||ametal|sqrt|fire|haveMyBullet|myDirection|distance||shotGap||dangergap|mindistank|curdis|tdegree|new|value|360|push|case|break|document|for||cur|isDanger|outerDot|300|mindis|sameXorYTank|dist|moveEv|Event|moveEvUp|fireEv|degree2direction|isOutOfScreen1|tankA|tankE|diffx|diffy|200|tankGap|moveX|moveY|holdX|holdY|isHold|avoidBullet|||innerDot|tempdis|Infinity|isAway|isOutX|keydown|direction2degree|pow|getDegree2Dir|getTankDirection|isOutOfScreen2|getTankDistance|move||setTeameName||mybullets|aMyTankCount|find||100|aTankCount|aMyBulletCount1|aMyBulletCount2|otherPlayerBullets|continue|enemyBullets|cos|sin|tempx|tempy|isOutY'.split('|'),0,{}))