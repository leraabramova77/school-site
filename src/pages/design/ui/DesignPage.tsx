import { CalendarOff } from "lucide-react";
import type { ReactNode } from "react";
import { GradeChip, type GradeMark } from "@/entities/grade";
import { LessonCard } from "@/entities/lesson";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  PasswordInput,
  Skeleton,
} from "@/shared/ui";
import { AppShell } from "@/widgets/app-shell";
import { demoLessons } from "../model/demo-data";
import { DayStripDemo, ErrorStateDemo, ThemeSwitch } from "./InteractiveDemos";

const marks: GradeMark[] = [5, 4, 3, 2, "debt"];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-semibold text-text-muted text-footnote uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Витрина дизайн-системы на выдуманных данных — для утверждения вида (ТЗ-1 §5.6). */
export function DesignPage() {
  return (
    <AppShell current="/diary">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-semibold text-large-title tracking-tight">
            Дизайн-система
          </h1>
          <p className="text-body text-text-muted">
            Все данные на странице выдуманные.
          </p>
          <ThemeSwitch />
        </header>

        <Section title="Лента дней">
          <DayStripDemo />
        </Section>

        <Section title="Уроки">
          <div className="flex flex-col gap-3">
            {demoLessons.map(({ lesson, grades, current }) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                current={current}
                grades={grades.map((g) => (
                  <GradeChip
                    key={g.id}
                    mark={g.mark}
                    weight={g.weight}
                    workType={g.workType}
                  />
                ))}
              />
            ))}
          </div>
        </Section>

        <Section title="Оценки">
          <div className="flex flex-wrap items-center gap-2">
            {marks.map((m) => (
              <GradeChip key={m} mark={m} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {marks.map((m) => (
              <GradeChip key={m} mark={m} size="sm" weight={10} showWeight />
            ))}
          </div>
        </Section>

        <Section title="Кнопки">
          <div className="flex flex-wrap gap-2">
            <Button>Войти</Button>
            <Button variant="secondary">Отмена</Button>
            <Button variant="outline">Неделя</Button>
            <Button variant="ghost">Сегодня</Button>
            <Button variant="destructive">Выйти</Button>
            <Button disabled>Недоступно</Button>
          </div>
        </Section>

        <Section title="Поля">
          <Card>
            <CardHeader>
              <CardTitle>Вход</CardTitle>
              <CardDescription>
                Неофициальный клиент. Пароль не сохраняется.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input
                placeholder="Логин"
                autoComplete="off"
                aria-label="Логин"
              />
              <PasswordInput
                placeholder="Пароль"
                autoComplete="off"
                aria-label="Пароль"
              />
              <Input
                placeholder="С ошибкой"
                aria-label="Поле с ошибкой"
                aria-invalid
              />
              <Button className="w-full">Войти</Button>
            </CardContent>
          </Card>
        </Section>

        <Section title="Загрузка">
          <Card className="flex items-start gap-3 p-4" aria-busy>
            <Skeleton className="h-10 w-12" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="size-8 rounded-full" />
          </Card>
        </Section>

        <Section title="Пусто и ошибка">
          <Card>
            <EmptyState
              icon={<CalendarOff aria-hidden />}
              title="Уроков нет"
              description="Выходной — можно отдохнуть."
            />
          </Card>
          <Card>
            <ErrorStateDemo />
          </Card>
        </Section>
      </main>
    </AppShell>
  );
}
