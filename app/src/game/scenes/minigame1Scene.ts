import Phaser from "phaser";
import { GameState } from "../../stores/GameState";
import { ObjectiveManager } from "../../managers/ObjectiveManager";
import { BOOK_SCENE_CONFIG } from "../constants/book";

export default class minigame1Scene extends Phaser.Scene {
  private currentLevel: number | undefined;
  private tasks: {
    id: number;
    sprite: Phaser.GameObjects.Image;
    column: string;
  }[] = [];
  private columns: { name: string; x: number; tasks: number[] }[] = [];
  private correctColumns: { name: string; tasks: number[] }[] = [];
  private button!: Phaser.GameObjects.Image;

  constructor() {
    super({ key: "minigame1Scene" });
  }

  init(): void {
    this.currentLevel = GameState.currentLevel;
  }

  preload(): void {
    this.load.image(
      "minigame1-background",
      "/assets/game/level3/minigames/hierarchy-tasks/minigame1-background.png"
    );
    this.load.image(
      "todo",
      "/assets/game/level3/minigames/hierarchy-tasks/toDo.png"
    );
    this.load.image(
      "inProgress",
      "/assets/game/level3/minigames/hierarchy-tasks/inProgress.png"
    );
    this.load.image(
      "done",
      "/assets/game/level3/minigames/hierarchy-tasks/done.png"
    );
    this.load.image(
      "task1",
      "/assets/game/level3/minigames/hierarchy-tasks/task1.png"
    );
    this.load.image(
      "task2",
      "/assets/game/level3/minigames/hierarchy-tasks/task2.png"
    );
    this.load.image(
      "task3",
      "/assets/game/level3/minigames/hierarchy-tasks/task3.png"
    );
    this.load.image(
      "task4",
      "/assets/game/level3/minigames/hierarchy-tasks/task4.png"
    );
    this.load.image(
      "task5",
      "/assets/game/level3/minigames/hierarchy-tasks/task5.png"
    );
    this.load.image(
      "task6",
      "/assets/game/level3/minigames/hierarchy-tasks/task6.png"
    );
    this.load.image(
      "task7",
      "/assets/game/level3/minigames/hierarchy-tasks/task7.png"
    );
    this.load.image(
      "task8",
      "/assets/game/level3/minigames/hierarchy-tasks/task8.png"
    );
    this.load.image(
      "task9",
      "/assets/game/level3/minigames/hierarchy-tasks/task9.png"
    );
  }

  create(): void {
    const { width, height } = this.scale;

    this.add
      .rectangle(
        0,
        0,
        width,
        height,
        BOOK_SCENE_CONFIG.OVERLAY.COLOR,
        BOOK_SCENE_CONFIG.OVERLAY.ALPHA
      )
      .setOrigin(0);

    this.add.image(width / 2, height / 2, "minigame1-background");

    this.columns = [
      { name: "todo", x: width / 2 - 250, tasks: [] },
      { name: "inProgress", x: width / 2, tasks: [] },
      { name: "done", x: width / 2 + 250, tasks: [] },
    ];

    this.correctColumns = [
      { name: "todo", tasks: [1, 2, 3] },
      { name: "inProgress", tasks: [4, 5, 6] },
      { name: "done", tasks: [7, 8, 9] },
    ];

    this.add.image(this.columns[0].x, height / 2, "todo");
    this.add.image(this.columns[1].x, height / 2, "inProgress");
    this.add.image(this.columns[2].x, height / 2, "done");

    this.shuffleAndDistributeTasks();

    const buttonY = height / 2 + 198;
    this.button = this.add
      .image(width / 2, buttonY, "button")
      .setInteractive({ useHandCursor: "true" })
      .on("pointerdown", () => {
        this.button.setTexture("buttonPressed");
      })
      .on("pointerup", () => {
        this.button.setTexture("button");
        if (this.isCorrect()) {
          const level = this.currentLevel ?? GameState.currentLevel ?? 3;
          console.log("Success!");
          ObjectiveManager.completeTask(level, "minigame1");
          GameState.markMinigameCompleted("minigame1");
          const targetSceneKey = `Level${level}Scene`;
          this.scene.stop();
          this.scene.resume(targetSceneKey);
        } else {
          this.resetBoard();
        }
      })
      .on("pointerout", () => {
        this.button.setTexture("button");
      });

    this.add
      .text(width / 2, buttonY, "Submit", {
        fontSize: "24px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
  }

  private shuffleAndDistributeTasks(): void {
    const { height } = this.scale;

    const taskIds = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    for (let i = taskIds.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [taskIds[i], taskIds[j]] = [taskIds[j], taskIds[i]];
    }

    for (let i = 0; i < 9; i++) {
      const columnIndex = Math.floor(i / 3);
      const taskId = taskIds[i];

      this.columns[columnIndex].tasks.push(taskId);

      const taskIndexInColumn = i % 3;
      const taskY = height / 2 - 70 + taskIndexInColumn * 80;

      const taskSprite = this.add
        .image(this.columns[columnIndex].x, taskY, `task${taskId}`)
        .setInteractive({ useHandCursor: true });

      this.tasks.push({
        id: taskId,
        sprite: taskSprite,
        column: this.columns[columnIndex].name,
      });

      this.makeTaskDraggable(taskSprite, taskId);
    }
  }

  private makeTaskDraggable(
    taskSprite: Phaser.GameObjects.Image,
    taskId: number
  ): void {
    let originalX: number;
    let originalY: number;

    this.input.setDraggable(taskSprite);

    taskSprite.on("dragstart", (pointer: Phaser.Input.Pointer) => {
      originalX = taskSprite.x;
      originalY = taskSprite.y;
      taskSprite.setToTop();
    });

    taskSprite.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        taskSprite.x = dragX;
        taskSprite.y = dragY;
      }
    );

    taskSprite.on("dragend", (pointer: Phaser.Input.Pointer) => {
      const droppedSlot = this.getSlotAtPosition(taskSprite.x, taskSprite.y);

      if (droppedSlot) {
        const taskInSlot = this.getTaskInSlot(
          droppedSlot.column,
          droppedSlot.slotIndex
        );
        if (taskInSlot && taskInSlot.id !== taskId) {
          this.animateSwap(taskId, taskInSlot.id);
        } else if (!taskInSlot) {
          this.animateMoveToSlot(
            taskId,
            droppedSlot.column,
            droppedSlot.slotIndex
          );
        } else {
          taskSprite.x = originalX;
          taskSprite.y = originalY;
        }
      } else {
        taskSprite.x = originalX;
        taskSprite.y = originalY;
      }
    });
  }

  private getSlotAtPosition(
    x: number,
    y: number
  ): { column: string; slotIndex: number } | null {
    const { height } = this.scale;
    const columnTolerance = 100;
    const slotTolerance = 40;

    for (const column of this.columns) {
      if (Math.abs(x - column.x) <= columnTolerance) {
        for (let slotIndex = 0; slotIndex < 3; slotIndex++) {
          const slotY = height / 2 - 70 + slotIndex * 80;
          if (Math.abs(y - slotY) <= slotTolerance) {
            return { column: column.name, slotIndex };
          }
        }
      }
    }
    return null;
  }

  private getTaskInSlot(
    columnName: string,
    slotIndex: number
  ): { id: number; sprite: Phaser.GameObjects.Image; column: string } | null {
    const column = this.columns.find((c) => c.name === columnName);
    if (!column || slotIndex >= column.tasks.length) {
      return null;
    }

    const taskId = column.tasks[slotIndex];
    return this.tasks.find((t) => t.id === taskId) || null;
  }

  private moveTaskToSlot(
    taskId: number,
    columnName: string,
    slotIndex: number
  ): void {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const column = this.columns.find((c) => c.name === columnName);
    if (!column) return;

    const oldColumn = this.columns.find((c) => c.tasks.includes(taskId));
    if (oldColumn) {
      oldColumn.tasks = oldColumn.tasks.filter((id) => id !== taskId);
    }

    while (column.tasks.length <= slotIndex) {
      column.tasks.push(0);
    }

    column.tasks[slotIndex] = taskId;
    task.column = columnName;
  }

  private switchTasks(taskId1: number, taskId2: number): void {
    const task1 = this.tasks.find((t) => t.id === taskId1);
    const task2 = this.tasks.find((t) => t.id === taskId2);

    if (!task1 || !task2) return;

    const column1 = this.columns.find((c) => c.name === task1.column);
    const column2 = this.columns.find((c) => c.name === task2.column);

    if (column1 && column2) {
      const task1Index = column1.tasks.indexOf(taskId1);
      const task2Index = column2.tasks.indexOf(taskId2);

      column1.tasks[task1Index] = taskId2;
      column2.tasks[task2Index] = taskId1;

      task1.column = column2.name;
      task2.column = column1.name;
    }
  }

  private redrawAllTasks(): void {
    const { height } = this.scale;

    for (const column of this.columns) {
      for (let i = 0; i < column.tasks.length; i++) {
        const taskId = column.tasks[i];
        const task = this.tasks.find((t) => t.id === taskId);

        if (task) {
          const slotY = height / 2 - 70 + i * 80;

          task.sprite.x = column.x;
          task.sprite.y = slotY;

          task.column = column.name;
        }
      }
    }
  }

  private getSlotPosition(
    columnName: string,
    slotIndex: number
  ): { x: number; y: number } {
    const { height } = this.scale;
    const column = this.columns.find((c) => c.name === columnName);
    const x = column ? column.x : 0;
    const y = height / 2 - 70 + slotIndex * 80;
    return { x, y };
  }

  private getTaskIndexInColumn(
    taskId: number
  ): { columnName: string; slotIndex: number } | null {
    for (const column of this.columns) {
      const idx = column.tasks.indexOf(taskId);
      if (idx !== -1) return { columnName: column.name, slotIndex: idx };
    }
    return null;
  }

  private animateSwap(taskId1: number, taskId2: number): void {
    const task1Info = this.tasks.find((t) => t.id === taskId1);
    const task2Info = this.tasks.find((t) => t.id === taskId2);
    if (!task1Info || !task2Info) return;

    const task1Idx = this.getTaskIndexInColumn(taskId1);
    const task2Idx = this.getTaskIndexInColumn(taskId2);
    if (!task1Idx || !task2Idx) return;

    const targetPosFor1 = this.getSlotPosition(
      task2Idx.columnName,
      task2Idx.slotIndex
    );
    const targetPosFor2 = this.getSlotPosition(
      task1Idx.columnName,
      task1Idx.slotIndex
    );

    let completed = 0;
    const onTweenComplete = () => {
      completed++;
      if (completed === 2) {
        this.switchTasks(taskId1, taskId2);
        this.redrawAllTasks();
      }
    };

    this.tweens.add({
      targets: task1Info.sprite,
      x: targetPosFor1.x,
      y: targetPosFor1.y,
      duration: 200,
      ease: "Sine.easeInOut",
      onComplete: onTweenComplete,
    });

    this.tweens.add({
      targets: task2Info.sprite,
      x: targetPosFor2.x,
      y: targetPosFor2.y,
      duration: 200,
      ease: "Sine.easeInOut",
      onComplete: onTweenComplete,
    });
  }

  private animateMoveToSlot(
    taskId: number,
    columnName: string,
    slotIndex: number
  ): void {
    const taskInfo = this.tasks.find((t) => t.id === taskId);
    if (!taskInfo) return;

    const { x, y } = this.getSlotPosition(columnName, slotIndex);

    this.tweens.add({
      targets: taskInfo.sprite,
      x,
      y,
      duration: 200,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.moveTaskToSlot(taskId, columnName, slotIndex);
        this.redrawAllTasks();
      },
    });
  }

  private isCorrect(): boolean {
    for (const correctColumn of this.correctColumns) {
      const currentColumn = this.columns.find(
        (c) => c.name === correctColumn?.name
      );
      if (!currentColumn) return false;
      if (currentColumn.tasks.length !== correctColumn.tasks.length)
        return false;

      for (let i = 0; i < correctColumn.tasks.length; i++) {
        if (currentColumn.tasks[i] !== correctColumn.tasks[i]) return false;
      }
    }
    return true;
  }

  private resetBoard(): void {
    this.tasks.forEach((task) => task.sprite.destroy());
    this.tasks = [];
    this.columns.forEach((col) => (col.tasks = []));
    this.shuffleAndDistributeTasks();
  }

  shutdown() {
    this.tasks.forEach((task) => {
      task.sprite.removeAllListeners();
      this.input.setDraggable(task.sprite, false);
      if (task.sprite.disableInteractive) task.sprite.disableInteractive();
      task.sprite.destroy();
    });

    this.tweens.killAll();

    if (this.button) {
      this.button.removeAllListeners();
      if (this.button.disableInteractive) this.button.disableInteractive();
      this.button.destroy();
    }
  }
}
