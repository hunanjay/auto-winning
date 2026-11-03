#!/usr/bin/env python3
"""
DSH 剪映草稿导出器 (Jianying Draft Exporter)
基于 pyJianYingDraft，将长视频切片与 ASR 字幕智能打包为剪映原生工程
"""
import sys
import os
import json
import uuid
import time
import shutil

try:
    import pyJianYingDraft as draft
except ImportError:
    print(json.dumps({"code": 1, "error": "pyJianYingDraft is not installed"}))
    sys.exit(1)

def get_draft_root():
    user_home = os.path.expanduser("~")
    # macOS 剪映草稿目录
    mac_path = os.path.join(user_home, "Movies/JianyingPro/User Data/Projects/com.lveditor.draft")
    if os.path.exists(os.path.dirname(mac_path)):
        os.makedirs(mac_path, exist_ok=True)
        return mac_path
    
    # Windows 剪映草稿目录
    localappdata = os.environ.get("LOCALAPPDATA", "")
    if localappdata:
        win_path = os.path.join(localappdata, "JianyingPro/User Data/Projects/com.lveditor.draft")
        if os.path.exists(os.path.dirname(win_path)):
            os.makedirs(win_path, exist_ok=True)
            return win_path

    # 兜底
    os.makedirs(mac_path, exist_ok=True)
    return mac_path

def update_root_meta_info(root_path, draft_id, draft_name, draft_fold_path, draft_json_file, duration_us, cover_path="", materials_size=0):
    meta_file = os.path.join(root_path, "root_meta_info.json")
    now_us = int(time.time() * 1000000)
    
    root_data = {"all_draft_store": [], "draft_ids": 0, "root_path": root_path}
    if os.path.exists(meta_file):
        try:
            with open(meta_file, "r", encoding="utf-8") as f:
                root_data = json.load(f)
        except Exception:
            pass

    # 移除同名旧项
    store = [x for x in root_data.get("all_draft_store", []) if x.get("draft_name") != draft_name]
    
    new_entry = {
        "cloud_draft_cover": False,
        "cloud_draft_sync": False,
        "draft_cloud_last_action_download": False,
        "draft_cloud_purchase_info": "",
        "draft_cloud_template_id": "",
        "draft_cloud_tutorial_info": "",
        "draft_cloud_videocut_purchase_info": "",
        "draft_cover": cover_path or "",
        "draft_fold_path": draft_fold_path,
        "draft_id": draft_id,
        "draft_is_ai_shorts": False,
        "draft_is_cloud_temp_draft": False,
        "draft_is_infinite_canvas_draft": False,
        "draft_is_invisible": False,
        "draft_is_pippit_draft": False,
        "draft_is_web_article_video": False,
        "draft_json_file": draft_json_file,
        "draft_name": draft_name,
        "draft_new_version": "",
        "draft_root_path": root_path,
        "draft_timeline_materials_size": materials_size or 0,
        "draft_type": "",
        "draft_web_article_video_enter_from": "",
        "pippit_avatar_url": "",
        "pippit_extra_info": "",
        "pippit_id": "",
        "pippit_user_name": "",
        "streaming_edit_draft_ready": True,
        "tm_draft_cloud_completed": "",
        "tm_draft_cloud_entry_id": -1,
        "tm_draft_cloud_modified": 0,
        "tm_draft_cloud_parent_entry_id": -1,
        "tm_draft_cloud_space_id": -1,
        "tm_draft_cloud_user_id": -1,
        "tm_draft_create": now_us,
        "tm_draft_modified": now_us,
        "tm_draft_removed": 0,
        "tm_duration": duration_us
    }
    # 插入到最顶端
    store.insert(0, new_entry)
    root_data["all_draft_store"] = store
    root_data["draft_ids"] = len(store)
    
    try:
        with open(meta_file, "w", encoding="utf-8") as f:
            json.dump(root_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Warning: Failed to update root_meta_info: {e}", file=sys.stderr)

def export_draft(payload):
    video_path = os.path.abspath(payload["videoPath"])
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video file not found: {video_path}")

    clips = payload.get("clips", [])
    if not clips:
        raise ValueError("No clips provided to export")

    sentences = payload.get("sentences", [])
    width = int(payload.get("width", 1080))
    height = int(payload.get("height", 1920))
    fps = int(payload.get("fps", 30))
    draft_name = payload.get("draftName", f"AI智能切片_{time.strftime('%m%d_%H%M%S')}")

    root_path = get_draft_root()
    folder = draft.DraftFolder(root_path)

    # 创建草稿
    script = folder.create_draft(draft_name, width, height, fps, allow_replace=True)
    draft_folder_path = os.path.join(root_path, draft_name)
    draft_id = str(uuid.uuid4()).upper()

    # 跨平台素材映射机制：
    # 1. macOS：App Store/沙盒版剪映无法读取外部目录，利用 APFS 写时克隆 (cp -c)，0ms 耗时，0 额外磁盘占用。
    # 2. Windows：
    #    - Windows 剪映基于 Win32 架构，原生没有 App Sandbox 权限限制，可直接读取系统任意磁盘路径。
    #    - 为保证草稿独立性与防误删，优先使用 NTFS 硬链接 (os.link) 映射至草稿 materials/，耗时 0ms，0 额外磁盘占用。
    #    - 若原视频与草稿箱跨盘符（例如 C盘 vs D盘），Windows 会直接引用原视频绝对路径，免去大文件重复拷贝的漫长等待。
    video_mat_path = video_path
    draft_materials_dir = os.path.join(draft_folder_path, "materials")
    video_filename = os.path.basename(video_path)
    internal_video_path = os.path.join(draft_materials_dir, video_filename)

    if sys.platform == "darwin":
        os.makedirs(draft_materials_dir, exist_ok=True)
        if not os.path.exists(internal_video_path):
            try:
                import subprocess
                subprocess.run(["cp", "-c", video_path, internal_video_path], check=True)
                video_mat_path = internal_video_path
            except Exception:
                try:
                    os.link(video_path, internal_video_path)
                    video_mat_path = internal_video_path
                except Exception:
                    shutil.copyfile(video_path, internal_video_path)
                    video_mat_path = internal_video_path
        else:
            video_mat_path = internal_video_path
    elif sys.platform.startswith("win"):
        os.makedirs(draft_materials_dir, exist_ok=True)
        if not os.path.exists(internal_video_path):
            try:
                os.link(video_path, internal_video_path)
                video_mat_path = internal_video_path
            except Exception:
                # 跨盘符无法硬链接时，Windows 剪映无沙盒限制，直接使用原视频物理路径，免去大文件耗时拷贝
                video_mat_path = video_path
        else:
            video_mat_path = internal_video_path

    # 1. 视频主轨道
    script.append_track(draft.TrackSpec(draft.TrackType.video, name="main_video"))
    video_mat = draft.VideoMaterial(video_mat_path)

    # 2. 字幕副轨道
    script.append_track(draft.TrackSpec(draft.TrackType.text, name="subtitles"))
    # 3. 黄金卖点 Hook 花字轨道
    script.append_track(draft.TrackSpec(draft.TrackType.text, name="hook_headers"))

    timeline_cursor_us = 0

    for clip in clips:
        start_sec = float(clip["startSeconds"])
        duration_sec = float(clip["durationSeconds"])
        duration_us = int(duration_sec * 1000000)
        source_start_us = int(start_sec * 1000000)

        # 视频片段
        target_tr = draft.Timerange(timeline_cursor_us, duration_us)
        source_tr = draft.Timerange(source_start_us, duration_us)
        v_seg = draft.VideoSegment(video_mat, target_tr, source_timerange=source_tr)
        script.add_segment(v_seg, track="main_video")

        # 黄金卖点 Hook 花字 (置于画面中上方)
        hook_caption = clip.get("caption") or clip.get("hook") or clip.get("title") or ""
        if hook_caption:
            hook_style = draft.TextStyle(
                size=6.0,
                bold=True,
                color=(1.0, 0.85, 0.1), # 金黄色
                max_line_width=0.88
            )
            hook_border = draft.TextBorder(color=(0.0, 0.0, 0.0), width=30.0)
            hook_seg = draft.TextSegment(
                hook_caption,
                target_tr,
                style=hook_style,
                border=hook_border,
                clip_settings=draft.ClipSettings(transform_y=0.65)
            )
            script.add_segment(hook_seg, track="hook_headers")

        # 匹配该切片时间范围内的 ASR 字幕
        clip_end_sec = start_sec + duration_sec
        clip_sentences = []
        for s in sentences:
            s_begin = s.get("begin_time", 0) / 1000.0
            s_end = s.get("end_time", 0) / 1000.0
            if s_end > start_sec and s_begin < clip_end_sec:
                # 裁剪到切片内部
                act_begin = max(s_begin, start_sec)
                act_end = min(s_end, clip_end_sec)
                if act_end > act_begin:
                    clip_sentences.append({
                        "text": s.get("text", ""),
                        "rel_start": act_begin - start_sec,
                        "rel_dur": act_end - act_begin
                    })

        # 添加台词字幕
        for cs in clip_sentences:
            sub_tr = draft.Timerange(
                timeline_cursor_us + int(cs["rel_start"] * 1000000),
                int(cs["rel_dur"] * 1000000)
            )
            sub_style = draft.TextStyle(size=5.5, bold=True, color=(1.0, 1.0, 1.0))
            sub_border = draft.TextBorder(color=(0.1, 0.1, 0.1), width=25.0)
            sub_seg = draft.TextSegment(
                cs["text"],
                sub_tr,
                style=sub_style,
                border=sub_border,
                clip_settings=draft.ClipSettings(transform_y=-0.65) # 底部字幕区
            )
            script.add_segment(sub_seg, track="subtitles")

        timeline_cursor_us += duration_us

    # 保存 draft_content.json 与 draft_info.json
    script.save()
    draft_content_file = os.path.join(draft_folder_path, "draft_content.json")
    draft_info_file = os.path.join(draft_folder_path, "draft_info.json")
    if os.path.exists(draft_content_file):
        shutil.copyfile(draft_content_file, draft_info_file)

    # 自动生成草稿封面图 draft_cover.jpg (剪映桌面版需要缩略图索引)
    cover_path = os.path.join(draft_folder_path, "draft_cover.jpg")
    try:
        import subprocess
        subprocess.run([
            "ffmpeg", "-y", "-ss", "00:00:01", "-i", video_mat_path,
            "-vframes", "1", "-q:v", "2", cover_path
        ], check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        cover_path = ""

    materials_size = 0
    if os.path.exists(video_mat_path):
        materials_size = os.path.getsize(video_mat_path)

    # 补充生成 attachment_pc_common.json 确保工程配置完备
    attachment_file = os.path.join(draft_folder_path, "attachment_pc_common.json")
    if not os.path.exists(attachment_file):
        try:
            with open(attachment_file, "w", encoding="utf-8") as f:
                json.dump({
                    "ai_packaging_infos": [],
                    "ai_packaging_report_info": {"caption_id_list":[],"commercial_material":"","material_source":"","method":"","page_from":"","style":"","task_id":"","text_style":"","tos_id":"","video_category":""},
                    "broll": {"ai_packaging_infos":[],"ai_packaging_report_info":{"caption_id_list":[],"commercial_material":"","material_source":"","method":"","page_from":"","style":"","task_id":"","text_style":"","tos_id":"","video_category":""}},
                    "commercial_music_category_ids": [],
                    "pc_feature_flag": 0,
                    "recognize_tasks": [],
                    "template_item_infos": [],
                    "unlock_template_ids": []
                }, f)
        except Exception:
            pass

    # 更新全局 root_meta_info.json
    update_root_meta_info(
        root_path,
        draft_id,
        draft_name,
        draft_folder_path,
        draft_info_file,
        timeline_cursor_us,
        cover_path=cover_path,
        materials_size=materials_size
    )

    return {
        "code": 0,
        "draftName": draft_name,
        "draftPath": draft_folder_path,
        "clipsCount": len(clips),
        "durationSeconds": round(timeline_cursor_us / 1000000.0, 2),
        "tracks": 3
    }

def main():
    if len(sys.argv) > 1 and sys.argv[1].endswith(".json"):
        with open(sys.argv[1], "r", encoding="utf-8") as f:
            payload = json.load(f)
    else:
        payload = json.load(sys.stdin)
    
    res = export_draft(payload)
    print(json.dumps(res, ensure_ascii=False))

if __name__ == "__main__":
    main()
