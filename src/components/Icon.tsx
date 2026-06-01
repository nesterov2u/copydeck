import arrowBackUp from "../../icons/tabler_arrow-back-up.svg";
import circleArrowRight from "../../icons/tabler_circle-arrow-right.svg";
import copy from "../../icons/tabler_copy.svg";
import database from "../../icons/tabler_database.svg";
import fileArrowLeft from "../../icons/tabler_file-arrow-left.svg";
import fileTypeDoc from "../../icons/tabler_file-type-doc.svg";
import files from "../../icons/tabler_files.svg";
import keyboard from "../../icons/tabler_keyboard.svg";
import language from "../../icons/tabler_language.svg";
import layoutList from "../../icons/tabler_layout-list.svg";
import list from "../../icons/tabler_list.svg";
import logo from "../../icons/Logo.svg";
import pinned from "../../icons/tabler_pinned.svg";
import playerSkipBack from "../../icons/tabler_player-skip-back.svg";
import playerSkipForward from "../../icons/tabler_player-skip-forward.svg";
import playlistAdd from "../../icons/tabler_playlist-add.svg";
import settings from "../../icons/tabler_settings.svg";
import squareRoundedCheck from "../../icons/tabler_square-rounded-check.svg";
import squareRoundedCheckOutline from "../../icons/tabler_square-rounded-check-1.svg";
import unpin from "../../icons/unpin.svg";
import worldBolt from "../../icons/tabler_world-bolt.svg";

const icons = {
  arrowBackUp,
  circleArrowRight,
  copy,
  database,
  fileArrowLeft,
  fileTypeDoc,
  files,
  keyboard,
  language,
  layoutList,
  list,
  logo,
  pinned,
  playerSkipBack,
  playerSkipForward,
  playlistAdd,
  settings,
  squareRoundedCheck,
  squareRoundedCheckOutline,
  unpin,
  worldBolt
};

export type IconName = keyof typeof icons;

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <img
      className="asset-icon"
      src={icons[name]}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
    />
  );
}
