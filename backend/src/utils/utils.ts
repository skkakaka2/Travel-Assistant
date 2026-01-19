import { DayPlanItem } from 'src/day-plan-item/entities/day-plan-item.entity';
import { User } from 'src/user/entities/user.entity';

//预测行程花费（油费+过路费）
export async function predictTripCost(
  item: DayPlanItem,
  userInfo: User,
): Promise<number> {
  const userRow = await this.userRepository.findOne({
    where: {
      id: userInfo.id,
    },
  });
  const dayPlan = await this.dayPlanRepository.findOne({
    where: {
      id: item.dayPlanId,
    },
  });
  const distance = item.distance ?? 0;
  let roadCost = 0;
  if (dayPlan!.isHoliday === 1) {
    roadCost = 0;
  }
  const carCost = distance * userRow!.perKilometerCost!;
  const totalCost = roadCost + carCost;
  return parseInt(totalCost.toFixed(0));
}
