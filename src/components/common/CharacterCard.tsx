import { useEffect, useState } from "react"
import { Avatar } from "~/components/ui/Avatar"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import * as siteModel from "~/models/site.model"
import type { Profile } from "~/lib/types"
import { cn } from "~/lib/utils"
import { useDate } from "~/hooks/useDate"
import { useTranslation } from "next-i18next"

export const CharacterCard: React.FC<{
  siteId?: string
  address?: string
  open?: boolean
  setButtonLoading?: (loading: boolean) => void
  hideFollowButton?: boolean
  style?: "flat" | "normal"
}> = ({ siteId, address, open, setButtonLoading, hideFollowButton, style }) => {
  const [firstOpen, setFirstOpen] = useState("")
  const [site, setSite] = useState<Profile>()
  const date = useDate()
  const { t } = useTranslation("common")

  useEffect(() => {
    if (open && (firstOpen !== (siteId || address) || !site)) {
      if (siteId || address) {
        setFirstOpen(siteId || address || "")
        if (siteId) {
          siteModel.getSite(siteId).then((site) => setSite(site))
        } else if (address) {
          siteModel
            .getUserSites({ address })
            .then((sites) => setSite(sites?.[0]))
        }
      } else {
        setSite(undefined)
      }
    }
  }, [open, firstOpen, siteId, address, site])

  return (
    <span
      className={cn(
        "border-gray-100 rounded-lg space-y-2 text-sm block",
        style === "flat" ? "" : "p-4 bg-white shadow-xl",
      )}
    >
      {site ? (
        <>
          <span className="flex items-center justify-between">
            <Avatar images={site?.avatars || []} name={site?.name} size={45} />
            {!hideFollowButton && (
              <FollowingButton
                site={site}
                size="sm"
                loadingStatusChange={(status) => setButtonLoading?.(status)}
              />
            )}
          </span>
          <span className="block">
            <span className="font-bold text-base text-zinc-800">
              {site?.name}
            </span>
            <span className="ml-1 text-gray-600">@{site.username}</span>
          </span>
          {site?.description && (
            <span
              className="block text-gray-600"
              dangerouslySetInnerHTML={{ __html: site?.description || "" }}
            ></span>
          )}
          <span className="block">
            <FollowingCount siteId={site.username} disableList={true} />
          </span>
          {site?.date_created && (
            <span className="block text-gray-500">
              <time dateTime={date.formatToISO(site.date_created)}>
                {t("joined ago", {
                  time: date.dayjs
                    .duration(
                      date
                        .dayjs(site.date_created)
                        .diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })}
              </time>
            </span>
          )}
        </>
      ) : (
        <>{t("Loading")}...</>
      )}
    </span>
  )
}
