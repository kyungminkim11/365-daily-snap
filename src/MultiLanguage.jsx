import { useEffect, useMemo, useRef, useState } from "react";

const LANGUAGES = [
  { code: "ko", label: "한국어", shortLabel: "KO", htmlLang: "ko-KR", title: "365 Daily Snap | 인물 스냅 포트폴리오" },
  { code: "ja", label: "日本語", shortLabel: "JP", htmlLang: "ja-JP", title: "365 Daily Snap | ポートレート撮影ポートフォリオ" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en", title: "365 Daily Snap | Portrait Photography Portfolio" },
];

const TEXT = {
  "Portfolio": { ko: "포트폴리오", ja: "ポートフォリオ", en: "Portfolio" },
  "Process": { ko: "진행 과정", ja: "撮影の流れ", en: "Process" },
  "Guide": { ko: "촬영 가이드", ja: "撮影ガイド", en: "Guide" },
  "Reviews": { ko: "후기", ja: "レビュー", en: "Reviews" },
  "Collaboration": { ko: "협업", ja: "コラボ", en: "Collaboration" },
  "Contact": { ko: "연락", ja: "お問い合わせ", en: "Contact" },
  "협업 문의": { ko: "협업 문의", ja: "コラボ相談", en: "Collaboration" },
  "365 Daily Snap": { ko: "365 Daily Snap", ja: "365 Daily Snap", en: "365 Daily Snap" },
  "Portrait Photography": { ko: "인물 스냅", ja: "ポートレート撮影", en: "Portrait Photography" },
  "있는 그대로, 자연스럽게 남기는 인물 사진": {
    ko: "있는 그대로, 자연스럽게 남기는 인물 사진",
    ja: "ありのままを自然に残すポートレート",
    en: "Natural portraits that feel like you",
  },
  "서울·수도권을 중심으로 인물 스냅을 촬영합니다. 어색한 포즈보다 편안한 분위기를 먼저 생각하며, 개인 프로필, 데일리 스냅, 커플 촬영까지 자연스럽게 담아냅니다.": {
    ko: "서울·수도권을 중심으로 인물 스냅을 촬영합니다. 어색한 포즈보다 편안한 분위기를 먼저 생각하며, 개인 프로필, 데일리 스냅, 커플 촬영까지 자연스럽게 담아냅니다.",
    ja: "ソウル・首都圏を中心に、東京での撮影日程も相談できます。無理なポーズよりも自然な雰囲気を大切にし、プロフィール、日常スナップ、カップル撮影まで丁寧に残します。",
    en: "Portrait sessions are available around Seoul and the capital area, with Tokyo dates by arrangement. I focus on relaxed moments rather than stiff poses, from personal profiles to daily snaps and couple sessions.",
  },
  "포트폴리오 보기": { ko: "포트폴리오 보기", ja: "作品を見る", en: "View Portfolio" },
  "실제 후기 보기": { ko: "실제 후기 보기", ja: "レビューを見る", en: "Read Reviews" },
  "협업 문의하기": { ko: "협업 문의하기", ja: "コラボ相談する", en: "Ask About Collaboration" },
  "서울": { ko: "서울", ja: "ソウル", en: "Seoul" },
  "Seoul": { ko: "서울", ja: "ソウル", en: "Seoul" },
  "Seoul / Capital Area": { ko: "서울 / 수도권", ja: "ソウル / 首都圏", en: "Seoul / Capital Area" },
  "Seoul / Capital Area / Model Collaboration": {
    ko: "서울 / 수도권 / 모델 협업",
    ja: "ソウル / 首都圏 / モデルコラボ",
    en: "Seoul / Capital Area / Model Collaboration",
  },
  "Model Collaboration": { ko: "모델 협업", ja: "モデルコラボ", en: "Model Collaboration" },
  "포트폴리오에서는 인물, 프로필, 카페, 거리, 야외, 실내, 낮, 밤, 자연광, 클로즈업 같은 태그로 사진을 나눠볼 수 있어요. 마음에 드는 사진이 있다면 문의할 때 함께 알려주시면 콘셉트 잡기가 쉬워집니다.": {
    ko: "포트폴리오에서는 인물, 프로필, 카페, 거리, 야외, 실내, 낮, 밤, 자연광, 클로즈업 같은 태그로 사진을 나눠볼 수 있어요. 마음에 드는 사진이 있다면 문의할 때 함께 알려주시면 콘셉트 잡기가 쉬워집니다.",
    ja: "ポートフォリオでは、人物、プロフィール、カフェ、街、屋外、室内、昼、夜、自然光、クローズアップなどのタグで写真を確認できます。気に入った雰囲気があれば、相談時に教えてください。",
    en: "You can browse the portfolio by tags such as portrait, profile, cafe, street, outdoor, indoor, day, night, natural light, and close-up. If you find a look you like, send it with your inquiry.",
  },
  "촬영 분위기, 시간대, 장소, 모델 태그로 작업을 나눠볼 수 있습니다.": {
    ko: "촬영 분위기, 시간대, 장소, 모델 태그로 작업을 나눠볼 수 있습니다.",
    ja: "撮影の雰囲気、時間帯、場所、モデルタグで作品を探せます。",
    en: "Browse by mood, time, location, and model tags.",
  },
  "촬영 진행 과정": { ko: "촬영 진행 과정", ja: "撮影の流れ", en: "How the Shoot Works" },
  "촬영 컨셉 문의부터 최종본 전달까지 단계별로 진행합니다. 촬영 목적과 분위기를 먼저 정리하고, 셀렉과 보정 과정도 함께 확인합니다.": {
    ko: "촬영 컨셉 문의부터 최종본 전달까지 단계별로 진행합니다. 촬영 목적과 분위기를 먼저 정리하고, 셀렉과 보정 과정도 함께 확인합니다.",
    ja: "コンセプト相談から最終データのお渡しまで、段階ごとに進めます。撮影目的と雰囲気を整理し、セレクトやレタッチも一緒に確認します。",
    en: "From concept inquiry to final delivery, the process is handled step by step. We clarify your purpose and mood first, then review selection and editing together.",
  },
  "촬영 문의하기": { ko: "촬영 문의하기", ja: "撮影相談する", en: "Inquire About a Shoot" },
  "촬영 전 준비 안내": { ko: "촬영 전 준비 안내", ja: "撮影前の準備", en: "Before the Shoot" },
  "처음 촬영하는 분도 부담 없이 준비할 수 있도록 꼭 필요한 내용만 정리했습니다.": {
    ko: "처음 촬영하는 분도 부담 없이 준비할 수 있도록 꼭 필요한 내용만 정리했습니다.",
    ja: "初めての方でも安心して準備できるよう、必要なことだけをまとめました。",
    en: "A simple checklist so even first-time clients can prepare comfortably.",
  },
  "문의할 때 함께 보내면 좋아요": { ko: "문의할 때 함께 보내면 좋아요", ja: "相談時に送るとスムーズです", en: "Helpful to Send With Your Inquiry" },
  "희망 날짜, 장소, 촬영 목적, 참고 이미지, 공개 가능 범위를 알려주시면 상담이 훨씬 빨라집니다.": {
    ko: "희망 날짜, 장소, 촬영 목적, 참고 이미지, 공개 가능 범위를 알려주시면 상담이 훨씬 빨라집니다.",
    ja: "希望日、場所、撮影目的、参考画像、公開可能範囲を教えていただくと、相談がスムーズです。",
    en: "Preferred dates, location, purpose, reference images, and usage preferences make the consultation much faster.",
  },
  "준비 내용으로 문의하기": { ko: "준비 내용으로 문의하기", ja: "準備内容で相談する", en: "Start With This Checklist" },
  "함께 촬영한 분들의 후기": { ko: "함께 촬영한 분들의 후기", ja: "撮影レビュー", en: "Client Reviews" },
  "실제로 함께 촬영한 분들이 남겨주신 후기입니다. 촬영 분위기, 소통 방식, 결과물에 대한 경험을 확인하실 수 있습니다.": {
    ko: "실제로 함께 촬영한 분들이 남겨주신 후기입니다. 촬영 분위기, 소통 방식, 결과물에 대한 경험을 확인하실 수 있습니다.",
    ja: "実際に撮影した方々からのレビューです。撮影の雰囲気、コミュニケーション、仕上がりについて確認できます。",
    en: "Reviews from people I have photographed. See what the shoot felt like, how communication worked, and how the results turned out.",
  },
  "후기 공유": { ko: "후기 공유", ja: "レビューを共有", en: "Share Reviews" },
  "모델 협업 촬영 문의": { ko: "모델 협업 촬영 문의", ja: "モデルコラボ撮影の相談", en: "Model Collaboration Inquiry" },
  "365 Daily Snap은 인물 중심의 포트폴리오 협업 촬영을 진행합니다. 촬영 목적과 콘셉트를 먼저 정리하고, 현장에서는 자연스러운 표정과 흐름을 함께 만들어갑니다.": {
    ko: "365 Daily Snap은 인물 중심의 포트폴리오 협업 촬영을 진행합니다. 촬영 목적과 콘셉트를 먼저 정리하고, 현장에서는 자연스러운 표정과 흐름을 함께 만들어갑니다.",
    ja: "365 Daily Snapは人物中心のポートフォリオ撮影・コラボ撮影を行っています。目的とコンセプトを整理し、現場では自然な表情と流れを一緒に作ります。",
    en: "365 Daily Snap offers portrait-focused portfolio and collaboration shoots. We clarify the purpose and concept first, then create natural expressions and flow on location.",
  },
  "Schedule": { ko: "일정", ja: "スケジュール", en: "Schedule" },
  "촬영 일정 안내": { ko: "촬영 일정 안내", ja: "撮影スケジュール", en: "Shooting Schedule" },
  "365 Daily Snap은 사전 조율된 일정에 맞춰 촬영을 진행합니다. 주말과 공휴일, 평일 저녁 시간대 촬영을 중심으로 운영하며, 평일 낮 촬영은 가능한 일정에 한해 별도 조율합니다.": {
    ko: "365 Daily Snap은 사전 조율된 일정에 맞춰 촬영을 진행합니다. 주말과 공휴일, 평일 저녁 시간대 촬영을 중심으로 운영하며, 평일 낮 촬영은 가능한 일정에 한해 별도 조율합니다.",
    ja: "365 Daily Snapは事前に調整した日程で撮影を行います。週末・祝日・平日夜を中心に、平日昼は可能な日程に限り相談できます。",
    en: "Shoots are arranged in advance. Weekends, holidays, and weekday evenings are the main slots; weekday daytime sessions are available depending on schedule.",
  },
  "서울과 수도권을 중심으로 촬영하며, 일산·고양 지역도 편하게 문의하실 수 있습니다. 그 외 지역이나 시간대는 일정에 따라 조율 가능하니 희망 날짜와 장소를 함께 보내주세요.": {
    ko: "서울과 수도권을 중심으로 촬영하며, 일산·고양 지역도 편하게 문의하실 수 있습니다. 그 외 지역이나 시간대는 일정에 따라 조율 가능하니 희망 날짜와 장소를 함께 보내주세요.",
    ja: "ソウル・首都圏を中心に撮影し、一山・高陽エリアも相談できます。東京での撮影日程も調整可能な場合がありますので、希望日と場所を一緒に送ってください。",
    en: "Shoots are mainly around Seoul and the capital area, including Ilsan and Goyang. Tokyo dates may also be arranged, so please send your preferred date and location together.",
  },
  "카카오톡 문의": { ko: "카카오톡 문의", ja: "KakaoTalkで相談", en: "KakaoTalk Inquiry" },
  "사진이 필요한 순간을 보내주세요.": { ko: "사진이 필요한 순간을 보내주세요.", ja: "写真が必要な瞬間を教えてください。", en: "Tell me the moment you want photographed." },
  "촬영 목적, 희망 날짜, 장소를 남겨주시면 확인 후 답변드립니다.": {
    ko: "촬영 목적, 희망 날짜, 장소를 남겨주시면 확인 후 답변드립니다.",
    ja: "撮影目的、希望日、場所を送っていただければ確認後に返信します。",
    en: "Send your purpose, preferred date, and location. I will review and reply.",
  },
  "카카오톡 오픈채팅": { ko: "카카오톡 오픈채팅", ja: "KakaoTalkオープンチャット", en: "KakaoTalk Open Chat" },
  "Instagram DM": { ko: "Instagram DM", ja: "Instagram DM", en: "Instagram DM" },
  "© 365 Daily Snap. Portrait Photography.": { ko: "© 365 Daily Snap. 인물 스냅.", ja: "© 365 Daily Snap. ポートレート撮影.", en: "© 365 Daily Snap. Portrait Photography." },

  "문의": { ko: "문의", ja: "相談", en: "Inquiry" },
  "일정 조율": { ko: "일정 조율", ja: "日程調整", en: "Schedule Coordination" },
  "촬영": { ko: "촬영", ja: "撮影", en: "Shoot" },
  "전달": { ko: "전달", ja: "納品", en: "Delivery" },
  "촬영 컨셉 문의": { ko: "촬영 컨셉 문의", ja: "コンセプト相談", en: "Concept Inquiry" },
  "일정 및 장소 확정": { ko: "일정 및 장소 확정", ja: "日程・場所の確定", en: "Confirm Date and Location" },
  "촬영 진행": { ko: "촬영 진행", ja: "撮影", en: "Photo Session" },
  "원본 전달": { ko: "원본 전달", ja: "元データ共有", en: "Original Files" },
  "작가 1차 셀렉": { ko: "작가 1차 셀렉", ja: "フォトグラファー一次セレクト", en: "Photographer First Select" },
  "모델 1차 셀렉": { ko: "모델 1차 셀렉", ja: "モデル一次セレクト", en: "Model First Select" },
  "보정 작업": { ko: "보정 작업", ja: "レタッチ", en: "Editing" },
  "최종본 전달": { ko: "최종본 전달", ja: "最終データ納品", en: "Final Delivery" },
  "원하는 분위기, 촬영 목적, 참고 이미지를 바탕으로 방향을 정리합니다.": {
    ko: "원하는 분위기, 촬영 목적, 참고 이미지를 바탕으로 방향을 정리합니다.",
    ja: "希望の雰囲気、撮影目的、参考画像をもとに方向性を整理します。",
    en: "We define the direction based on your desired mood, purpose, and references.",
  },
  "촬영 가능 날짜와 장소를 조율한 뒤 최종 일정을 확정합니다.": {
    ko: "촬영 가능 날짜와 장소를 조율한 뒤 최종 일정을 확정합니다.",
    ja: "撮影可能な日程と場所を調整し、最終スケジュールを決めます。",
    en: "We coordinate available dates and locations, then confirm the final schedule.",
  },
  "현장 분위기에 맞춰 자연스러운 포즈와 표정을 함께 만들어갑니다.": {
    ko: "현장 분위기에 맞춰 자연스러운 포즈와 표정을 함께 만들어갑니다.",
    ja: "現場の雰囲気に合わせて、自然なポーズや表情を一緒に作ります。",
    en: "We create natural poses and expressions based on the mood on location.",
  },
  "요청 시 촬영 원본 전체를 전달드립니다.": {
    ko: "요청 시 촬영 원본 전체를 전달드립니다.",
    ja: "ご希望の場合、撮影した元データを共有できます。",
    en: "Original files can be shared upon request.",
  },
  "작가가 먼저 결과물을 검토하고 1차 후보를 정리합니다.": {
    ko: "작가가 먼저 결과물을 검토하고 1차 후보를 정리합니다.",
    ja: "フォトグラファーが先に写真を確認し、一次候補を整理します。",
    en: "The photographer reviews the results and prepares the first selection.",
  },
  "전달받은 후보 중 원하는 컷을 직접 선택하실 수 있습니다.": {
    ko: "전달받은 후보 중 원하는 컷을 직접 선택하실 수 있습니다.",
    ja: "共有された候補の中から、ご希望のカットを選べます。",
    en: "You can choose your preferred shots from the shared candidates.",
  },
  "선택된 사진을 기준으로 색감, 피부, 분위기 보정을 진행합니다.": {
    ko: "선택된 사진을 기준으로 색감, 피부, 분위기 보정을 진행합니다.",
    ja: "選ばれた写真をもとに、色味、肌、雰囲気を自然にレタッチします。",
    en: "Selected photos are edited for color, skin, and overall mood.",
  },
  "보정 완료 후 Google Drive 링크 또는 카카오톡 오픈채팅으로 전달드립니다.": {
    ko: "보정 완료 후 Google Drive 링크 또는 카카오톡 오픈채팅으로 전달드립니다.",
    ja: "レタッチ後、Google DriveリンクまたはKakaoTalkでお渡しします。",
    en: "Final files are delivered via Google Drive link or KakaoTalk after editing.",
  },

  "연락 받을 방법": { ko: "연락 받을 방법", ja: "連絡方法", en: "Contact Method" },
  "가능한 연락 수단을 여러 개 적어도 괜찮아요.": { ko: "가능한 연락 수단을 여러 개 적어도 괜찮아요.", ja: "複数の連絡方法を選んでも大丈夫です。", en: "You can choose more than one contact method." },
  "문의 유형": { ko: "문의 유형", ja: "相談タイプ", en: "Inquiry Type" },
  "상호무페이 / TFP": { ko: "상호무페이 / TFP", ja: "相互無償 / TFP", en: "TFP / Collaboration" },
  "유료 촬영": { ko: "유료 촬영", ja: "有料撮影", en: "Paid Shoot" },
  "상담 후 결정": { ko: "상담 후 결정", ja: "相談して決める", en: "Decide After Consultation" },
  "이름 / 닉네임": { ko: "이름 / 닉네임", ja: "名前 / ニックネーム", en: "Name / Nickname" },
  "핸드폰 번호": { ko: "핸드폰 번호", ja: "電話番号", en: "Phone Number" },
  "카카오톡 ID": { ko: "카카오톡 ID", ja: "KakaoTalk ID", en: "KakaoTalk ID" },
  "이메일": { ko: "이메일", ja: "メール", en: "Email" },
  "전화": { ko: "전화", ja: "電話", en: "Call" },
  "문자": { ko: "문자", ja: "SMS", en: "Text" },
  "촬영 가능 일정": { ko: "촬영 가능 일정", ja: "撮影可能日", en: "Available Dates" },
  "희망 날짜": { ko: "희망 날짜", ja: "希望日", en: "Preferred Date" },
  "희망 날짜 추가": { ko: "희망 날짜 추가", ja: "希望日を追加", en: "Add Preferred Date" },
  "가능한 시간대": { ko: "가능한 시간대", ja: "可能な時間帯", en: "Available Time" },
  "희망 장소": { ko: "희망 장소", ja: "希望場所", en: "Preferred Location" },
  "직접 입력": { ko: "직접 입력", ja: "直接入力", en: "Custom Location" },
  "출발 지역": { ko: "출발 지역", ja: "出発エリア", en: "Departure Area" },
  "원하는 분위기": { ko: "원하는 분위기", ja: "希望する雰囲気", en: "Desired Mood" },
  "촬영 목적": { ko: "촬영 목적", ja: "撮影目的", en: "Shoot Purpose" },
  "촬영 인원": { ko: "촬영 인원", ja: "撮影人数", en: "Number of People" },
  "사진 사용 범위": { ko: "사진 사용 범위", ja: "写真の使用範囲", en: "Photo Usage" },
  "추가로 남길 말": { ko: "추가로 남길 말", ja: "追加メッセージ", en: "Additional Message" },
  "참고 이미지 업로드": { ko: "참고 이미지 업로드", ja: "参考画像アップロード", en: "Upload References" },
  "최대 6장, 장당 10MB 이하": { ko: "최대 6장, 장당 10MB 이하", ja: "最大6枚、1枚10MBまで", en: "Up to 6 images, 10MB each" },
  "촬영 문의 보내기": { ko: "촬영 문의 보내기", ja: "撮影相談を送る", en: "Send Inquiry" },
  "문의 보내는 중": { ko: "문의 보내는 중", ja: "送信中", en: "Sending" },
  "연락 받을 방식을 하나 이상 선택해주세요.": { ko: "연락 받을 방식을 하나 이상 선택해주세요.", ja: "連絡方法を1つ以上選択してください。", en: "Please choose at least one contact method." },
  "연락 받을 수단을 하나 이상 입력해주세요.": { ko: "연락 받을 수단을 하나 이상 입력해주세요.", ja: "連絡先を1つ以上入力してください。", en: "Please enter at least one contact detail." },
  "문의가 접수되었습니다. 확인 후 연락드릴게요.": { ko: "문의가 접수되었습니다. 확인 후 연락드릴게요.", ja: "相談内容を受け付けました。確認後にご連絡します。", en: "Your inquiry has been received. I will contact you after checking it." },
  "저장에 실패했습니다. 카카오톡 오픈채팅 또는 Instagram DM으로 보내주세요.": { ko: "저장에 실패했습니다. 카카오톡 오픈채팅 또는 Instagram DM으로 보내주세요.", ja: "保存に失敗しました。KakaoTalkまたはInstagram DMで送ってください。", en: "Saving failed. Please send it via KakaoTalk or Instagram DM." },

  "성함 또는 닉네임": { ko: "성함 또는 닉네임", ja: "お名前またはニックネーム", en: "Your name or nickname" },
  "010-0000-0000": { ko: "010-0000-0000", ja: "電話番号", en: "Phone number" },
  "name@example.com": { ko: "name@example.com", ja: "name@example.com", en: "name@example.com" },
  "원하는 색감, 피하고 싶은 느낌, 참고 계정이나 링크를 적어주세요.": { ko: "원하는 색감, 피하고 싶은 느낌, 참고 계정이나 링크를 적어주세요.", ja: "希望する色味、避けたい雰囲気、参考アカウントやリンクを書いてください。", en: "Share your preferred colors, moods to avoid, reference accounts, or links." },
  "촬영에서 걱정되는 점, 꼭 원하는 컷, 일정 관련 메모를 자유롭게 적어주세요.": { ko: "촬영에서 걱정되는 점, 꼭 원하는 컷, 일정 관련 메모를 자유롭게 적어주세요.", ja: "撮影で不安なこと、必ず撮りたいカット、日程に関するメモを自由に書いてください。", en: "Write anything you are worried about, must-have shots, or schedule notes." },

  "촬영 상담 도우미": { ko: "촬영 상담 도우미", ja: "撮影相談ヘルプ", en: "Shoot Assistant" },
  "상담": { ko: "상담", ja: "相談", en: "Chat" },
  "궁금한 내용을 입력해보세요": { ko: "궁금한 내용을 입력해보세요", ja: "気になることを入力してください", en: "Ask anything about the shoot" },
  "안녕하세요. 촬영 방식, 협업 문의, 보정본 전달, 준비물처럼 자주 묻는 내용을 바로 안내드릴게요.": {
    ko: "안녕하세요. 촬영 방식, 협업 문의, 보정본 전달, 준비물처럼 자주 묻는 내용을 바로 안내드릴게요.",
    ja: "こんにちは。撮影方法、コラボ相談、納品、準備物など、よくある質問をすぐにご案内します。",
    en: "Hi. I can quickly guide you through common questions about shoot style, collaboration, delivery, and preparation.",
  },
  "처음인데 어떻게 문의하면 돼요?": { ko: "처음인데 어떻게 문의하면 돼요?", ja: "初めてですが、どう相談すればいいですか？", en: "It is my first time. How should I inquire?" },
  "상호무페이 협업 가능해요?": { ko: "상호무페이 협업 가능해요?", ja: "TFPコラボは可能ですか？", en: "Do you offer TFP collaboration?" },
  "주말이나 퇴근 후 촬영 가능해요?": { ko: "주말이나 퇴근 후 촬영 가능해요?", ja: "週末や仕事後の撮影は可能ですか？", en: "Can we shoot on weekends or after work?" },
  "어떤 장소가 잘 어울릴까요?": { ko: "어떤 장소가 잘 어울릴까요?", ja: "どんな場所が合いますか？", en: "What location would fit well?" },
  "사진이 어색해도 괜찮나요?": { ko: "사진이 어색해도 괜찮나요?", ja: "写真が苦手でも大丈夫ですか？", en: "Is it okay if I feel awkward in photos?" },
  "보정본은 어떻게 받아요?": { ko: "보정본은 어떻게 받아요?", ja: "レタッチ済み写真はどう受け取りますか？", en: "How do I receive edited photos?" },
  "문의 폼 작성하기": { ko: "문의 폼 작성하기", ja: "相談フォームを書く", en: "Fill Out Inquiry Form" },
};

const ATTRIBUTE_NAMES = ["placeholder", "aria-label", "title"];
const SKIP_SELECTOR = "script, style, noscript, textarea, input, select, option, svg, [data-no-translate='true']";

function getInitialLanguage() {
  if (typeof window === "undefined") {
    return "ko";
  }

  const saved = window.localStorage.getItem("site-language");
  if (LANGUAGES.some((language) => language.code === saved)) {
    return saved;
  }

  const browserLanguage = window.navigator.language?.toLowerCase() || "";
  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }
  if (browserLanguage.startsWith("en")) {
    return "en";
  }

  return "ko";
}

function translateDynamicText(source, language) {
  if (!source) {
    return source;
  }

  const photosMatch = source.match(/^(\d+)\s+Photos$/i);
  if (photosMatch) {
    if (language === "ko") return `사진 ${photosMatch[1]}장`;
    if (language === "ja") return `写真 ${photosMatch[1]}枚`;
    return `${photosMatch[1]} Photos`;
  }

  const reviewsMatch = source.match(/^(\d+)\s+Reviews$/i);
  if (reviewsMatch) {
    if (language === "ko") return `후기 ${reviewsMatch[1]}개`;
    if (language === "ja") return `レビュー ${reviewsMatch[1]}件`;
    return `${reviewsMatch[1]} Reviews`;
  }

  return null;
}

function translateText(source, language) {
  const cleanSource = source.trim();
  const exact = TEXT[cleanSource]?.[language];
  if (exact) {
    return exact;
  }

  const dynamic = translateDynamicText(cleanSource, language);
  if (dynamic) {
    return dynamic;
  }

  return cleanSource;
}

function shouldSkipNode(node) {
  const parent = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  return !parent || Boolean(parent.closest(SKIP_SELECTOR));
}

export default function MultiLanguage() {
  const [language, setLanguage] = useState(getInitialLanguage);
  const originalTextByNode = useRef(new WeakMap());
  const selectedLanguage = useMemo(() => LANGUAGES.find((item) => item.code === language) || LANGUAGES[0], [language]);

  useEffect(() => {
    window.localStorage.setItem("site-language", language);
    document.documentElement.lang = selectedLanguage.htmlLang;
    document.title = selectedLanguage.title;
  }, [language, selectedLanguage]);

  useEffect(() => {
    let frameId = 0;

    const applyTranslations = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (shouldSkipNode(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          const text = node.textContent || "";
          return text.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });

      const textNodes = [];
      let currentNode = walker.nextNode();
      while (currentNode) {
        textNodes.push(currentNode);
        currentNode = walker.nextNode();
      }

      textNodes.forEach((node) => {
        if (!originalTextByNode.current.has(node)) {
          originalTextByNode.current.set(node, node.textContent || "");
        }

        const original = originalTextByNode.current.get(node) || "";
        const leading = original.match(/^\s*/)?.[0] || "";
        const trailing = original.match(/\s*$/)?.[0] || "";
        const translated = translateText(original, language);
        const nextText = `${leading}${translated}${trailing}`;

        if (node.textContent !== nextText) {
          node.textContent = nextText;
        }
      });

      document.querySelectorAll("[placeholder], [aria-label], [title]").forEach((element) => {
        if (element.closest(SKIP_SELECTOR) && !element.matches("input, textarea")) {
          return;
        }

        ATTRIBUTE_NAMES.forEach((attributeName) => {
          const value = element.getAttribute(attributeName);
          if (!value) {
            return;
          }

          const originalAttribute = `data-i18n-original-${attributeName}`;
          if (!element.hasAttribute(originalAttribute)) {
            element.setAttribute(originalAttribute, value);
          }

          const source = element.getAttribute(originalAttribute) || value;
          const translated = translateText(source, language);
          if (translated && value !== translated) {
            element.setAttribute(attributeName, translated);
          }
        });
      });
    };

    const scheduleApply = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(applyTranslations);
    };

    scheduleApply();

    const observer = new MutationObserver(scheduleApply);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [language]);

  return (
    <aside className="language-switcher" aria-label="Language selector" data-no-translate="true">
      <span className="language-switcher-label">Language</span>
      <div className="language-switcher-options" role="group" aria-label="Language selector">
        {LANGUAGES.map((item) => (
          <button
            key={item.code}
            type="button"
            className={item.code === language ? "is-active" : ""}
            onClick={() => setLanguage(item.code)}
            aria-pressed={item.code === language}
            title={item.label}
          >
            {item.shortLabel}
          </button>
        ))}
      </div>
    </aside>
  );
}
