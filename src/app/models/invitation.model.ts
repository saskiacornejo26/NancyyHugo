export interface Couple {
  bride: string;
  groom: string;
  monogram: string;
  hashtag: string;
}

export interface ParentPair {
  title: string;
  names: string[];
}

export interface Venue {
  title: string;
  time: string;
  name: string;
  address: string;
  mapUrl: string;
}

export interface TimelineItem {
  time: string;
  title: string;
  detail: string;
  icon: 'ceremony' | 'reception' | 'toast' | 'dinner' | 'party';
}

export interface GiftInfo {
  bankAccount: string;
  interbank: string;
  yape: string;
  registryUrl: string;
}

export interface Tip {
  title: string;
  text: string;
}

export interface CoupleSong {
  title: string;
  artist: string;
  url: string;
}

export interface CoupleVideo {
  title: string;
  caption: string;
  url: string;
}

export interface GuestInfo {
  name: string;
  passes: number;
}

export interface InvitationData {
  couple: Couple;
  date: Date;
  dateLabel: string;
  city: string;
  quote: string;
  story: string;
  parents: ParentPair[];
  padrinos: ParentPair[];
  venues: Venue[];
  itinerary: TimelineItem[];
  gallery: string[];
  dressCode: {
    title: string;
    text: string;
    colors: { name: string; hex: string }[];
  };
  gifts: GiftInfo;
  tips: Tip[];
  couplePlaylist: CoupleSong[];
  coupleVideo: CoupleVideo;
  rsvpDeadline: string;
  whatsapp: string;
  musicTitle: string;
  musicUrl: string;
  driveAlbumUrl: string;
  driveFolderId: string;
  driveUploadUrl: string;
  songsSheetUrl: string;
}
