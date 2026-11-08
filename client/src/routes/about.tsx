import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  HeartHandshake,
  LockKeyhole,
  Users,
} from "lucide-react";
import { useI18n } from "../i18n/I18nContext";
import { SectionHeading } from "../components/ui";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

export default function AboutPage() {
  const { t } = useI18n();

  const team = [
    { initials: "AD", name: "Aylin Demir", role: t("about.roleAdmin"), color: "bg-primary" },
    { initials: "JW", name: "Jonas Weber", role: t("about.roleTech"), color: "bg-secondary" },
    { initials: "MK", name: "Marcel Koch", role: t("about.roleTech2"), color: "bg-accent" },
    { initials: "SR", name: "Sofia Reed", role: t("about.roleCustomer"), color: "bg-neutral" },
  ];

  return (
    <div className="bg-base-100">
      <section className="hero-grid border-b border-base-300">
        <div className="container-page py-14 sm:py-20">
          <p className="eyebrow">{t("about.eyebrow")}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-tight sm:text-5xl">
            {t("about.title")}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-base-content/65 sm:text-lg">
            {t("about.text")}
          </p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 lg:grid-cols-2 lg:items-center">
        <div>
          <SectionHeading title={t("about.storyTitle")} />
          <p className="mt-4 text-sm leading-relaxed text-base-content/65">{t("about.story1")}</p>
          <p className="mt-3 text-sm leading-relaxed text-base-content/65">{t("about.story2")}</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["10", "about.stat1"],
              ["14", "about.stat2"],
              ["2", "about.stat3"],
              ["4", "about.stat4"],
            ].map(([value, key]) => (
              <div key={key} className="rounded-box border border-base-300 bg-base-200/50 p-4">
                <p className="text-2xl font-black text-primary">{value}</p>
                <p className="text-xs text-base-content/65">{t(key as "about.stat1")}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-[2rem] bg-secondary/15" />
          <div className="relative grid gap-4 sm:grid-cols-2">
            {[
              { icon: Users, key: "value1" },
              { icon: BadgeCheck, key: "value2" },
              { icon: LockKeyhole, key: "value3" },
              { icon: HeartHandshake, key: "value4" },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="rounded-box border border-base-300 bg-base-100 p-5 shadow-sm">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 text-sm font-bold">
                  {t(`about.${key}.title` as "about.value1.title")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-base-content/65">
                  {t(`about.${key}.text` as "about.value1.text")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-space bg-base-200/60">
        <div className="container-page">
          <SectionHeading title={t("about.teamTitle")} text={t("about.teamText")} align="center" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-box border border-base-300 bg-base-100 p-6 text-center"
              >
                <span
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold text-base-content ${member.color}`}
                >
                  {member.initials}
                </span>
                <h3 className="mt-4 text-sm font-bold">{member.name}</h3>
                <p className="mt-1 text-xs text-base-content/65">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-14">
        <div className="flex flex-col items-start justify-between gap-4 rounded-box bg-primary p-8 text-primary-content sm:flex-row sm:items-center">
          <h2 className="text-2xl font-bold">{t("home.ctaTitle")}</h2>
          <Link to="/quote" search={{ service: undefined }} className="ds-btn ds-btn-accent">
            {t("about.cta")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
