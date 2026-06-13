# Cricbuzz Development Rules

Team ke har member ko module start karne se pehle ye rules read karne hain. Ye backend + frontend feature implementation ke liye reference document hai.

## 1. Module Dependency Order

```txt
Players -> Teams -> Squads -> Series -> Matches -> Playing XI -> Score -> Commentary
```

Reason:
- Team banane se pehle players chahiye.
- Squad banane se pehle team aur players dono chahiye.
- Match banane se pehle series, teams, aur dono teams ki squad me minimum 11 players chahiye.
- Playing XI select karne se pehle match `TOSS_COMPLETED` hona chahiye.
- Score/commentary add karne se pehle match `LIVE` hona chahiye.

## 2. Player Module Rules

Business rules:
- Player globally create hota hai, kisi ek team ka nahi hota.
- Ek active player sirf ek team squad me assigned ho sakta hai.
- Role enum sirf ye honge: `BATSMAN`, `BOWLER`, `ALL_ROUNDER`, `WICKET_KEEPER`.
- `battingStyle` required hai aur fixed enum se hi aayega: `RIGHT_HAND_BAT`, `LEFT_HAND_BAT`.
- `bowlingStyle` optional hai, but agar bheja to fixed enum se hi aayega: `RIGHT_ARM_FAST`, `RIGHT_ARM_FAST_MEDIUM`, `RIGHT_ARM_MEDIUM`, `LEFT_ARM_FAST`, `LEFT_ARM_FAST_MEDIUM`, `LEFT_ARM_MEDIUM`, `RIGHT_ARM_OFF_BREAK`, `RIGHT_ARM_LEG_BREAK`, `LEFT_ARM_ORTHODOX`, `LEFT_ARM_WRIST_SPIN`.
- Duplicate player name allow hai.

Edge cases:
- Player delete karna ho aur wo kisi team squad me hai to block karo.
- Player delete karna ho aur wo kisi match Playing XI me hai to block karo.
- Player role change already Playing XI/captain/WK case me allow ho sakta hai, but warning/awareness rakho.
- Soft deleted player public/admin list me nahi dikhna chahiye.

Public visibility:
- Players publicly visible hain.
- Soft deleted players public se hide honge.

## 3. Team Module Rules

Business rules:
- Team `name` aur `shortName` unique honge.
- Team create ke liye `logo` required hai.
- `squadPlayers` team document me player ObjectId refs ka array hai.
- Player add karne ke liye `$addToSet` use karo so duplicate add idempotent rahe.
- Team module me sirf team identity/details manage honge: `name`, `shortName`, `logo`, `primaryColor`.
- Player assignment Team UI se nahi hoga; squad assignment sirf Squads module se hoga.

Edge cases:
- Team delete karna ho aur koi match me involved hai to block karo.
- Team delete karna ho aur series se match ke through linked hai to block karo.
- Same player dobara squad me add ho to silently ignore/idempotent.
- Team squad me 10 players hain to match create block hoga.
- Team logo update live match ke during allowed hai.
- Team squad me 20 se zyada players add nahi hone chahiye.

Public visibility:
- Teams publicly visible hain.
- Soft deleted teams public se hide honge.

## 4. Squad Module Rules

Business rules:
- Squad team ke andar players collection hai.
- Squads panel me teams ki list dikhegi; team select karne ke baad us team ka squad manage hoga.
- Squad manage ke liye team aur player dono exist hone chahiye.
- Match create se pehle minimum 11 players squad me hone chahiye.
- Route pattern: `/api/teams/:teamId/squad`.

Edge cases:
- Non-existing player add karo to error.
- Agar player kisi doosri team squad me assigned hai to add block karo.
- Already existing player add karo to duplicate nahi hona chahiye.
- 20 players ke baad squad add block karo.
- Live match Playing XI me selected player remove karna block karo.
- Remove ke baad squad 10 se kam ho jaye to allow, but match create later block hoga.
- Team exist nahi karti to 404.

## 5. Series Module Rules

Business rules:
- `name` aur `season` unique hone chahiye.
- Status flow: `UPCOMING -> LIVE -> COMPLETED [OR CANCELED]`.
- Series delete se pehle check karo ki koi match exist to nahi karta.
- Series is the only module to create a new match for the series .

Edge cases:
- for series only who have minimum 11 palyer in the squad is allowd , 
- Matches wali series delete block.
- Duplicate name/season par conflict.
- Series status manually change allowed for admin.
- Koi bhe series Delete nai hoga jabtak kuch bhe scudeld match ha .


flow:
-ADMIN Start date and End Date (date can be edited latter),name and seasion degaa 
-ONly allowd team will show to admin for add the teams into series
-then We have 3 type format  A/B/C 
  In A type :
  All the teams are devided into two group. All the matches are allowed in who are in the same group , after that in the end 1st 2tems of every group are go for the semi final and form group A 1st team will paly with group B 1st team and group A 2nd team will play with Group B 2nd team semifinal Match 
  in this only EVEN number of TEMAS are allowed.Then we will get 2 teams for final 

  In B type :
  The 1st 4 teams of points table will play semi-final match. 1st semi final match is "1th vs 2nd" team ,2nd semi-final match is "3rd vs 4th".Then we will get 2 teams for final.

- then ADMIN  will deisde number of matches . And can edit latter if need the number of matches

-Then admin will create match's ,In the time of creating matches uses select 2 temas ,date,

-All the matches are shows in the matches tab in the frontend . and show the match edit button in every created match . (Admin only)


Public visibility:
- Series public hain.
- Points table public hai and completed matches se calculate hota hai.

## 6. Match Module Rules

Strict state machine:

```txt
UPCOMING
  -> TOSS_COMPLETED
  -> PLAYING_XI_SELECTED
  -> LIVE
  -> INNINGS_BREAK
  -> COMPLETED
```

Edge cases:
- Match create tabhi jab dono teams ki squad me minimum 11 players hon.
- Same team dono sides par block.
- Toss already completed ho to toss record block.
- Playing XI ke bina match start block.
- LIVE match delete block ya strong warning.
- Score/commentary add match LIVE nahi hai to block.

Public visibility:
- Matches public hain with filters: `live`, `upcoming`, `completed`.

## 7. Playing XI Module Rules

Business rules:
- Dono teams ka XI ek API call me select hoga.
- Exactly 11 players per team.
- Exactly 1 captain per team.
- Exactly 1 wicket keeper per team.
- Selected players team squad me hone chahiye.
- Match status `TOSS_COMPLETED` hona chahiye.

Edge cases:
- 10/12 players selected -> 400.
- 2 captains -> 400.
- 0 wicket keepers -> 400.
- Squad ke bahar ka player -> 400.
- Duplicate player in XI -> 400.
- Re-select XI behavior explicitly decide karo: allow replacement ya block.

## 8. Score Module Rules

Business rules:
- Score document per innings hota hai.
- Match `LIVE` hona chahiye.
- Overs format `X.Y`, where `Y` must be 0-5.
- 2nd innings me `target` optional ho sakta hai.
- Har update par Socket.IO event: `score.updated`.

Edge cases:
- Same innings score dobara create na ho; update use karo.
- Wickets max 10.
- Overs invalid like `10.7` block.
- `runRate` negative block.

## 9. Commentary Module Rules

Business rules:
- Match `LIVE` hona chahiye.
- Types: `NORMAL`, `FOUR`, `SIX`, `WICKET`, `MILESTONE`.
- Ball 1-6 only, over 0 se start.
- Fetch reverse chronological order me.
- Pagination default 50 per page.
- Delete sirf `SUPER_ADMIN`/`ADMIN`.

Edge cases:
- Match LIVE nahi to add block.
- Ball 7 block.
- Same over.ball duplicate commentary allowed.
- `SCORER` commentary delete nahi kar sakta.

## 10. Public API Visibility

| Entity | Public Visible | Rule |
| --- | --- | --- |
| Players | Yes | Deleted hide |
| Teams | Yes | Deleted hide |
| Series | Yes | Deleted hide |
| Matches | Yes | Filter by status |
| Score | Yes | Via match center/scorecard |
| Commentary | Yes | Paginated, reverse order |
| Points Table | Yes | Calculated |
| Users/Admins | No | Admin only |

## 11. Soft Delete Global Rule

Har entity me `isDeleted: false` default rahega.

Rules:
- Delete API soft delete karegi, hard delete nahi.
- Saari read queries me `{ isDeleted: false }` filter lagega.
- Dependency exist ho to delete block karo.

Dependency check order:

```txt
Series delete -> check matches
Team delete   -> check matches
Player delete -> check squads / playing XI
Match delete  -> check LIVE status / score / commentary
```

## 12. Public Route Cache TTL

| Route | TTL |
| --- | --- |
| `/api/public/home` | 10s |
| `/api/public/matches` | 10s |
| `/api/public/matches/:id/commentary` | 5s |
| `/api/public/series/:id/points-table` | 30s |
| `/api/public/search` | 30s |
| `/api/public/series` | 60s |
| `/api/public/teams` | 60s |
| `/api/public/players` | 60s |

## 13. Role Permissions

| Operation | SUPER_ADMIN | ADMIN | SCORER |
| --- | --- | --- | --- |
| Create Admin/Scorer accounts | Yes | No | No |
| Series CRUD | Yes | Yes | No |
| Team CRUD | Yes | Yes | No |
| Player CRUD | Yes | Yes | No |
| Squad manage | Yes | Yes | No |
| Match create/update | Yes | Yes | No |
| Toss record | Yes | No | Yes |
| Playing XI select | Yes | No | Yes |
| Score create/update | Yes | No | Yes |
| Commentary add | Yes | No | Yes |
| Commentary delete | Yes | Yes | No |
| View all users | Yes | No | No |

## 14. Socket.IO Events

| Event | Trigger |
| --- | --- |
| `toss.updated` | Toss record |
| `playingXI.updated` | XI select |
| `match.started` | Match LIVE |
| `match.completed` | Match complete |
| `score.updated` | Score create/update |
| `commentary.created` | Commentary add |

Room pattern:

```txt
match:{matchId}
```

## 15. Development Checklist

Before merge:
- Validator lagao.
- RBAC route + service level check karo.
- Soft delete and `isDeleted: false` filter confirm karo.
- Dependency delete checks confirm karo.
- Duplicate/conflict cases handle karo.
- Public route cache and visibility check karo.
- Socket event required ho to emit karo.
- `npm --prefix api run check` and frontend build/check run karo where relevant.
