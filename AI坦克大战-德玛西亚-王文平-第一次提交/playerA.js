eval(
  (function (p, a, c, k, e, r) {
    e = function (c) {
      return (
        (c < 62 ? "" : e(parseInt(c / 62))) +
        ((c = c % 62) > 35 ? String.fromCharCode(c + 29) : c.toString(36))
      );
    };
    if ("0".replace(0, e) == 0) {
      while (c--) r[e(c)] = k[c];
      k = [
        function (e) {
          return r[e] || e;
        },
      ];
      e = function () {
        return "([479a-hj-zC-WZ]|[12]\\w)";
      };
      c = 1;
    }
    while (c--)
      if (k[c]) p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
    return p;
  })(
    '(s(h="A",w="德玛西亚"){4(!["A","B"].includes(h))h="A";7 1j=12 1k("1D");7 1l=12 1k("keyup");7 1m=12 1k("1D");7 1E=[D,0,K,q];7 degree2direction=12 Map([[D,0],[0,1],[13,1],[K,2],[q,3],]);s L(M){4(M<9.1F(10,-6)&&M>-9.1F(10,-6))a 0;d a M}s 1G(f){j l=[];f=f%13;4(f>0&&f<D){l=[1,0]}d 4(f>D&&f<q){l=[3,0]}d 4(f>q&&f<K){l=[3,2]}d 4(f>K&&f<13){l=[1,2]}4(f==0)l.14(1);4(f==D)l.14(0);4(f==q)l.14(3);4(f==K)l.14(2);a l}s 1H(e,15,16){4(15===0&&16===0){a x}j E=1;j F=0;4(15>0)E=1;d E=3;4(16>0)F=0;d F=2;7 1n=N(e,E,O);7 1I=N(e,F,O);4(!1n&&!1I){4(9.k(15)>9.k(16)){a E}d{a F}}4(1n){a F}d{a E}}s 1o(1p,1q){7 1r=1p.X-1q.X;7 1s=1p.Y-1q.Y;a 9.17(1r*1r+1s*1s)}s N(e,g,ametals){7 t=e.t;var y=typeof y==="s"?y:()=>u;4(g==0&&e.Y-t-G<=0&&y(e.X,e.Y-t,H)){a u}d 4(g==1&&e.X+t>=screenX-H&&y(e.X+t,e.Y,H)){a u}d 4(g==2&&e.Y+t>=screenY-H&&y(e.X,e.Y+t,H)){a u}d 4(g==3&&e.X-t<=0&&y(e.X-t,e.Y,H)){a u}a P}s 1J(g){4(g===x)a;j r=x;switch(g){18 0:r=h==="A"?87:38;19;18 2:r=h==="A"?83:40;19;18 3:r=h==="A"?65:37;19;18 1:r=h==="A"?68:39;19}4(r!==x){1j.r=r;1l.r=r;Q.1L(1j)}}7 R=()=>{1m.r=h==="A"?32:8;Q.1L(1m)};7 1M=(()=>{j i=0;a()=>{4(i>0)a;Q.1N(`1O${h==="B"?2:1}Name`).textContent=w;Q.1N(`1O${h==="B"?2:1}barName`).M=w;i++}})();s S(e,b,1P,m){j n=P;7 g=e.g;1a(j o of 1P){4(o.g===g){4(g===0&&9.k(o.X-e.X)<m&&b.Y<o.Y){n=u;a n}d 4(g===2&&9.k(o.X-e.X)<m&&b.Y>o.Y){n=u;a n}d 4(g===1&&9.k(o.Y-e.Y)<m&&b.X>o.X){n=u;a n}d 4(g===3&&9.k(o.Y-e.Y)<m&&b.X<o.X){n=u;a n}}}a n}window[`player${h}`]={land(){1M();7 c=1Q.1R((1c)=>1c.id==(h==="A"?G:1T));7 b=1Q.1R((1c)=>1c.id==(h==="A"?1T:G));4(!c||checkGameOver())a w;4(h==="A"&&player1Die)a w;4(h==="B"&&player2Die)a w;j T=1;4(playerNum===2){4(O.1d>0){T=3}d{T=2}}7 U=T===3?[...1U,b]:1U;7 V=h==="A"?1V:1W;7 1X=h==="B"?1V:1W;7 tankGap=1;j v=x;j 1e=0,1f=0,1g=P;1a(7 b of U){4(b===x)1t;7 W=c.g;7 m=G;7 dis=1o(c,b);4(W===0&&b.Y<c.Y&&9.k(b.X-c.X)<m&&!S(c,b,V,m)){R()}d 4(W===2&&b.Y>c.Y&&9.k(b.X-c.X)<m&&!S(c,b,V,m)){R()}d 4(W===1&&b.X>c.X&&9.k(b.Y-c.Y)<m&&!S(c,b,V,m)){R()}d 4(W===3&&b.X<c.X&&9.k(b.Y-c.Y)<m&&!S(c,b,V,m)){R()}}s 1u(1Y){1a(7 o of 1Y){7 z=o.X-c.X-25;7 C=c.Y+25-o.Y;7 1Z=9.17(z*z+C*C);4(1Z>300)1t;7 f=1E[o.g];7 Bx=L(9.20((f/q)*9.Z)*1);7 By=L(9.21((f/q)*9.Z)*1);7 22=z*Bx+C*By;7 1x=z*By-C*Bx;4(22<0&&9.k(1x)<G){j n=9.sign(1x);4(n==0)n=9.random()>0.5?1:-1;j l=n*D+f;7 1y=40/9.17(z*z+C*C);7 23=L(9.20((l/q)*9.Z));7 24=L(9.21((l/q)*9.Z));1e+=23*1y;1f+=24*1y;26.27("info",l,1e,1f);1g=u}}}1u(aBulletCount);4(T===3){1u(1X)}4(1g){v=1H(c,1e,1f)}d{j 1z=Infinity;j 1h=U[0];1a(7 b of U){4(b===x)1t;7 1A=1o(c,b);4(1A<1z){1z=1A;1h=b}}7 I=1h.X-c.X;7 J=c.Y-1h.Y;7 1B=9.17(I*I+J*J);j 11=(9.acos(I/1B)*q)/9.Z;4(J<0){11=13-11}j 1i=P;4(1B<G){11+=q;1i=P}7 p=1G(11);4(p.1d>0){4(p.1d==1)v=p[0];d{7 1C=N(c,p[0],O);7 28=N(c,p[1],O);4(1C||28){v=1C?p[1]:p[0]}d{4(1i&&U.1d>3){v=9.k(I)>9.k(J)?p[1]:p[0]}d{v=9.k(I)>9.k(J)?p[0]:p[1]}}}}4(1i){}d{}}26.27("final:",v,1g);1J(v);a w},leave(){Q.onkeyup(1l)},}})("A","德玛西亚");',
    [],
    133,
    "||||if|||const||Math|return|enemyTank|currentTank|else|tank|degree|direction|type||let|abs|tempdir|gap|flag|bullet|dir|180|keyCode|function|speed|true|moveDirection|teamName|undefined|collisionMetal|Ax|||Ay|90|dir1|dir2|100|tankWidth|TAx|TAy|270|zero|value|checkOutOfScreen|ametal|false|document|fire|haveMyBullet|level|enemyTanks|myBullets|myDirection|||PI||tdegree|new|360|push|movex|movey|sqrt|case|break|for||cur|length|moveX|moveY|isDanger|mindistank|isAway|moveEv|Event|moveEvUp|fireEv|isOutOfScreen1|getTankDistance|tankA|tankE|diffx|diffy|continue|avoidBullet|||outerDot|tempdis|mindis|curdis|dist|isOutX|keydown|direction2degree|pow|getDegree2Dir|getTankDirection|isOutOfScreen2|move||onkeydown|setTeameName|getElementById|Player|mybullets|aMyTankCount|find||200|aTankCount|aMyBulletCount1|aMyBulletCount2|otherPlayerBullets|enemyBullets|distance|cos|sin|innerDot|tempx|tempy||console|warn|isOutY".split(
      "|"
    ),
    0,
    {}
  )
);
