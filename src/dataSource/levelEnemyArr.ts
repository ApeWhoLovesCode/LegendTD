import { EnemyName } from "./enemyData";

const levelEnemyArr: EnemyName[][][] = [
  // 第一关
  [
    ['zombie-flag', 'zombie-1', 'zombie-1', 'zombie-1', 'zombie-2', 'zombie-2', 'zombie-2', 'zombie-3', 'zombie-3', 'zombie-3'],
    ['zombie-flag', 'zombie-3', 'zombie-3', 'zombie-1', 'zombie-1', 'zombie-1', 'zombie-2', 'zombie-2', 'zombie-3', 'zombie-3', 'iron-gate'],
    ['zombie-flag', 'iron-gate', 'zombie-1', 'zombie-1', 'zombie-2', 'zombie-2', 'zombie-3', 'zombie-3', 'zombie-3', 'iron-gate', 'iron-gate'],
    ['zombie-flag', 'iron-gate', 'zombie-2', 'zombie-1', 'zombie-1', 'zombie-2', 'zombie-3', 'iron-gate', 'rugby', 'pole-vault', 'pole-vault'],
    ['zombie-flag', 'rugby', 'zombie-2', 'zombie-1', 'zombie-2', 'zombie-2', 'iron-gate', 'iron-gate', 'rugby', 'pole-vault', 'rugby', 'zombie-boom'],
    ['zombie-flag', 'iron-gate', 'zombie-2', 'zombie-2', 'zombie-3', 'zombie-3', 'iron-gate', 'newspaper', 'iron-gate', 'iron-gate', 'newspaper', 'rugby'],
    ['zombie-flag', 'newspaper', 'newspaper', 'pole-vault', 'pole-vault', 'pole-vault', 'newspaper', 'pole-vault', 'pole-vault', 'pole-vault', 'rugby', 'rugby'],
    ['zombie-flag', 'rugby', 'rugby', 'rugby', 'rugby', 'rugby', 'rugby', 'rugby', 'rugby','zombie-boom', 'rugby','zombie-boom', 'rugby', 'zombie-boom', 'rugby'],
    ['zombie-flag', 'zombie-2', 'zombie-3', 'iron-gate', 'pole-vault', 'newspaper', 'newspaper', 'pole-vault', 'rugby', 'rugby', 'zombie-dance'],
    ['zombie-flag', 'iron-gate', 'iron-gate', 'iron-gate', 'iron-gate', 'zombie-boom', 'zombie-boom', 'iron-gate', 'rugby', 'rugby', 'rugby', 'zombie-dance'],
    ['zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag','zombie-flag'],
    ['zombie-flag','zombie-3','zombie-3','zombie-3','zombie-3','godzilla','zombie-3','zombie-3','zombie-3','zombie-3'],
    ['zombie-flag','zombie-3','zombie-dance','zombie-3','ice-car','iron-gate','iron-gate','rugby','rugby','rugby', 'zombie-dance'],
    ['zombie-flag','zombie-3','zombie-2','zombie-1','rabbish','rabbish-2','rabbish','zombie-1','zombie-2','zombie-3'],
    ['zombie-flag','zombie-2','zombie-3','pole-vault','iron-gate','rugby','pole-vault','zombie-dance','zombie-2','pole-vault','ice-car','ice-car'],
    ['zombie-flag','ice-car','zombie-1','ice-car','zombie-2','ice-car','zombie-3','ice-car','zombie-2','ice-car', 'zombie-1','ice-car'],
    ['zombie-flag','rabbish','zombie-dance','pole-vault','ice-car','zombie-dance','ice-car','pole-vault','rabbish', 'afu','rabbish'],
    ['zombie-flag','zombie-3','zombie-3','zombie-dance','zombie-dance','godzilla','zombie-dance','zombie-dance','zombie-3', 'zombie-3'],
    ['zombie-flag','rabbish','ice-car','zombie-dance','rabbish-2','rabbish-2','rabbish','zombie-dance','zombie-3', 'rabbish'],
    ['zombie-flag','zombie-1','zombie-2','zombie-3','iron-gate','rugby','newspaper','zombie-dance','pole-vault','ice-car','afu','fulisha','kunkun','rabbish','rabbish-2','zombie-boom','godzilla'],
    // -----  下面的关卡开始每5关，敌人升一次级 -----
    ['zombie-flag','iron-gate','rabbish','rabbish','rabbish-2','rabbish','rabbish','iron-gate'],
    ['zombie-flag','afu','rabbish','pole-vault','rugby','godzilla','rabbish-2','fulisha','fulisha','iron-gate'],
    ['zombie-flag','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom','zombie-boom'],
    ['zombie-flag','ice-car','ice-car','ice-car','ice-car','ice-car','ice-car','ice-car','ice-car','ice-car'],
    ['zombie-flag','godzilla','godzilla','godzilla','godzilla','godzilla','godzilla','godzilla','godzilla','godzilla'],
  ],
  // 第二关
]

export default levelEnemyArr