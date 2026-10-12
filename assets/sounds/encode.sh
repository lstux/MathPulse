#!/usr/bin/env bash
# Sons MathPulse — réencodage et sélection.
#
#   ./encode.sh                      réencode bank/*.wav en bank/*.mp3 (léger, mono, volume homogène)
#   ./encode.sh --clean              idem, puis supprime les .wav réencodés (ils restent dans l'historique git)
#   ./encode.sh pick <bank> <court> [secondes]
#                                    copie bank/<bank>.mp3 vers ./<court>.mp3 (le son « utilisé par l'app »),
#                                    en le coupant à <secondes> (petit fondu final) si précisé
#                                    ex. : ./encode.sh pick mixkit-correct-answer-notification-947 good
#
# bank/ = tous les sons disponibles (noms Mixkit d'origine) ; ce dossier = les sons choisis (noms courts).
# Pensez à mettre à jour CREDITS.md (tableau nom d'origine → nom court) et la liste du service worker.
set -euo pipefail
cd "$(dirname "$0")"

encode() {
  local clean=${1:-}
  command -v ffmpeg >/dev/null || { echo "ffmpeg est requis" >&2; exit 1; }
  shopt -s nullglob
  for wav in bank/*.wav; do
    local out="${wav%.wav}.mp3"
    # silence de tête retiré, volume homogène (-18 LUFS, discret), fondu de sortie de 40 ms, mono 96 kbit/s
    local dur; dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$wav")
    ffmpeg -y -loglevel error -i "$wav" \
      -af "silenceremove=start_periods=1:start_threshold=-50dB,loudnorm=I=-18:TP=-2:LRA=7,afade=t=out:st=$(awk "BEGIN{d=$dur-0.1; if(d<0)d=0; print d}"):d=0.04" \
      -ac 1 -ar 44100 -c:a libmp3lame -b:a 96k "$out"
    echo "$(basename "$out")  $(du -k "$out" | cut -f1) Ko"
    [ "$clean" = "--clean" ] && rm "$wav"
  done
  return 0
}

case "${1:-}" in
  pick)
    [ $# -ge 3 ] && [ $# -le 4 ] || { echo "usage : $0 pick <nom-dans-bank> <nom-court> [secondes]" >&2; exit 1; }
    src="bank/${2%.mp3}.mp3"
    [ -f "$src" ] || { echo "introuvable : $src (lancez d'abord ./encode.sh)" >&2; exit 1; }
    if [ -n "${4:-}" ]; then
      ffmpeg -y -loglevel error -i "$src" -t "$4" -af "afade=t=out:st=$(awk "BEGIN{print $4-0.08}"):d=0.08" -c:a libmp3lame -b:a 96k "${3%.mp3}.mp3"
      echo "${3%.mp3}.mp3 ← $src (coupé à ${4} s)"
    else
      cp "$src" "${3%.mp3}.mp3"; echo "${3%.mp3}.mp3 ← $src"
    fi ;;
  ""|--clean) encode "${1:-}" ;;
  *) echo "usage : $0 [--clean] | pick <bank> <court>" >&2; exit 1 ;;
esac
