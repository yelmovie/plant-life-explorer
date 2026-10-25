# 가방 3D 파일 확인과 Meshy 생성 프롬프트

## 현재 파일

`assets/models/`에는 잎자루 전체·단면과 알로에만 있다. 가방 GLB는 없다. 기존 입체 가방은 코드 도형이며, 이번 수정에서는 이미 만들어 둔 투명 가방 그림 네 종류를 기본으로 보여준다. 사용자가 원하면 간단한 입체 모형으로 전환할 수 있다.

아래 PNG는 기존에 보관한 Meshy 입력용 이미지다. 새 이미지를 불필요하게 생성하지 않았다. 각 파일을 해당 변형의 기준으로 사용한다.

| 생성할 GLB | 사용할 초기 이미지 |
|---|---|
| `bag_plain_open.glb` | [보통 천·열린 입구](../_source/meshy-input/m5-bag/meshy_m5_bag_plain_open.png) |
| `bag_plain_closed.glb` | [보통 천·덮개](../_source/meshy-input/m5-bag/meshy_m5_bag_plain_closed.png) |
| `bag_lotus_open.glb` | [연잎 겉면·열린 입구](../_source/meshy-input/m5-bag/meshy_m5_bag_lotus_open.png) |
| `bag_lotus_closed.glb` | [연잎 겉면·덮개](../_source/meshy-input/m5-bag/meshy_m5_bag_lotus_closed.png) |

## 공통 프롬프트

```text
One single realistic, child-friendly explorer's satchel for an elementary science game. Match the supplied reference image. Preserve the same bag proportions, body shape, carrying handle, side gussets, front pocket and craftsmanship across all four variants. A genuinely volumetric bag with real front-to-back depth and a visible interior; never a flat billboard or embossed image. Natural matte woven fabric, clean readable silhouette, softly rounded seams, no logos, labels, letters, people, background or pedestal. Model the top opening and its cover as real geometry. Keep the cover a separate named object, Cover, and the body named Body. Upright orientation, base centered at ground level, consistent dimensions and pivot across variants. Output textured GLB. The purpose is to compare the effects of the surface treatment and the cover independently, so do not change other features between versions.
```

각각 공통 프롬프트 뒤에 아래 문장을 붙여서 구분한다.

**보통 천 · 열린 입구**

```text
Variant: plain warm ivory canvas surface, OPEN top. The mouth is visibly open with a clearly modeled dark interior. No cover panel over the opening. No leaf pattern, no water droplets. Use the same body dimensions as the other variants.
```

**보통 천 · 덮개**

```text
Variant: the SAME plain warm ivory canvas bag, with a real CLOSED flap covering the top opening and overlapping the front rim. Keep an identifiable curved flap edge, hinge fold and small fastening tab. No leaf pattern. Change only the cover compared with the plain open bag.
```

**연잎 겉면 · 열린 입구**

```text
Variant: the SAME bag with an olive-green lotus-inspired outer material, a subtle natural leaf-vein motif and OPEN top. The opening and interior must remain fully visible. Do not cover the mouth with a leaf. The lotus-inspired treatment belongs only to the outer surface. Change only the surface compared with the plain open bag.
```

**연잎 겉면 · 덮개**

```text
Variant: the SAME olive-green lotus-inspired bag with the SAME subtle leaf-vein outer material, now with a CLOSED flap covering the top opening and overlapping the front rim. Preserve the same flap geometry as the plain closed bag. No added plants or decorative leaves. Change only the cover compared with the lotus open bag.
```

## 받은 뒤의 확인

네 모델의 크기·방향을 맞추고 90도 회전해 두께와 열린 입구를 확인한다. 겉면을 바꿀 때 입구 모양이 함께 바뀌지 않아야 한다. 새 파일이 오면 그림 모드와 함께 실제 GLB로 연결할 수 있다. 단순히 파일명만 맞춰 놓으면 현재 코드가 자동으로 불러오는 구조는 아니다.
