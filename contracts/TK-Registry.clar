(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-HASH (err u101))
(define-constant ERR-INVALID-TITLE (err u102))
(define-constant ERR-INVALID-DESCRIPTION (err u103))
(define-constant ERR-INVALID-KNOWLEDGE-TYPE (err u104))
(define-constant ERR-INVALID-ORIGIN (err u105))
(define-constant ERR-INVALID-ROYALTY-RATE (err u106))
(define-constant ERR-INVALID-LICENSE-TERMS (err u107))
(define-constant ERR-INVALID-GEOLOCATION (err u108))
(define-constant ERR-INVALID-BOUNDARIES (err u109))
(define-constant ERR-INVALID-TIMESTAMP (err u110))
(define-constant ERR-AUTHORITY-NOT-VERIFIED (err u111))
(define-constant ERR-GEOLOCATION-OUT-OF-BOUNDS (err u112))
(define-constant ERR-INVALID-BOUNDARIES-RANGE (err u113))
(define-constant ERR-TK-ALREADY-EXISTS (err u114))
(define-constant ERR-TK-NOT-FOUND (err u115))
(define-constant ERR-INVALID-UPDATE-HASH (err u116))
(define-constant ERR-INVALID-UPDATE-TITLE (err u117))
(define-constant ERR-INVALID-UPDATE-DESCRIPTION (err u118))
(define-constant ERR-UPDATE-NOT-ALLOWED (err u119))
(define-constant ERR-MAX-TK-EXCEEDED (err u120))
(define-constant ERR-INVALID-COMMUNITY (err u121))
(define-constant ERR-INVALID-CATEGORY (err u122))
(define-constant ERR-INVALID-USAGE-RIGHTS (err u123))
(define-constant ERR-INVALID-EXPIRATION (err u124))
(define-constant ERR-INVALID-STATUS (err u125))
(define-constant ERR-INVALID-VERSION (err u126))
(define-constant ERR-INVALID-METADATA (err u127))
(define-constant ERR-INVALID-ACCESS-LEVEL (err u128))

(define-data-var next-tk-id uint u0)
(define-data-var max-tk uint u10000)
(define-data-var registration-fee uint u500)
(define-data-var authority-contract (optional principal) none)

(define-map traditional-knowledge
  uint
  {
    hash: (buff 32),
    title: (string-ascii 100),
    description: (string-ascii 500),
    community: principal,
    knowledge-type: (string-ascii 50),
    origin: (string-ascii 100),
    royalty-rate: uint,
    license-terms: (string-ascii 1000),
    geolocation: { lat: int, lon: int },
    boundaries: { min-lat: int, max-lat: int, min-lon: int, max-lon: int },
    timestamp: uint,
    creator: principal,
    category: (string-ascii 50),
    usage-rights: (string-ascii 200),
    expiration: uint,
    status: bool,
    version: uint,
    metadata: (string-ascii 500),
    access-level: uint
  }
)

(define-map tk-by-hash
  (buff 32)
  uint)

(define-map tk-updates
  uint
  {
    update-hash: (buff 32),
    update-title: (string-ascii 100),
    update-description: (string-ascii 500),
    update-timestamp: uint,
    updater: principal,
    update-version: uint
  }
)

(define-read-only (get-tk (id uint))
  (map-get? traditional-knowledge id)
)

(define-read-only (get-tk-updates (id uint))
  (map-get? tk-updates id)
)

(define-read-only (is-tk-registered (h (buff 32)))
  (is-some (map-get? tk-by-hash h))
)

(define-private (validate-hash (h (buff 32)))
  (if (is-eq (len h) u32)
      (ok true)
      ERR-INVALID-HASH)
)

(define-private (validate-title (t (string-ascii 100)))
  (if (and (> (len t) u0) (<= (len t) u100))
      (ok true)
      ERR-INVALID-TITLE)
)

(define-private (validate-description (d (string-ascii 500)))
  (if (and (> (len d) u0) (<= (len d) u500))
      (ok true)
      ERR-INVALID-DESCRIPTION)
)

(define-private (validate-knowledge-type (kt (string-ascii 50)))
  (if (or (is-eq kt "medicinal") (is-eq kt "cultural") (is-eq kt "agricultural") (is-eq kt "spiritual"))
      (ok true)
      ERR-INVALID-KNOWLEDGE-TYPE)
)

(define-private (validate-origin (o (string-ascii 100)))
  (if (> (len o) u0)
      (ok true)
      ERR-INVALID-ORIGIN)
)

(define-private (validate-royalty-rate (rr uint))
  (if (and (>= rr u0) (<= rr u10000))
      (ok true)
      ERR-INVALID-ROYALTY-RATE)
)

(define-private (validate-license-terms (lt (string-ascii 1000)))
  (if (> (len lt) u0)
      (ok true)
      ERR-INVALID-LICENSE-TERMS)
)

(define-private (validate-geolocation (geo { lat: int, lon: int }))
  (let ((lat (get lat geo))
        (lon (get lon geo)))
    (if (and (>= lat -90000000) (<= lat 90000000)
             (>= lon -180000000) (<= lon 180000000))
        (ok true)
        ERR-GEOLOCATION-OUT-OF-BOUNDS))
)

(define-private (validate-boundaries (bounds { min-lat: int, max-lat: int, min-lon: int, max-lon: int }))
  (let ((min-lat (get min-lat bounds))
        (max-lat (get max-lat bounds))
        (min-lon (get min-lon bounds))
        (max-lon (get max-lon bounds)))
    (if (and (<= min-lat max-lat)
             (<= min-lon max-lon))
        (ok true)
        ERR-INVALID-BOUNDARIES-RANGE))
)

(define-private (validate-timestamp (ts uint))
  (if (>= ts block-height)
      (ok true)
      ERR-INVALID-TIMESTAMP)
)

(define-private (validate-community (c principal))
  (if (not (is-eq c 'SP000000000000000000002Q6VF78))
      (ok true)
      ERR-INVALID-COMMUNITY)
)

(define-private (validate-category (cat (string-ascii 50)))
  (if (> (len cat) u0)
      (ok true)
      ERR-INVALID-CATEGORY)
)

(define-private (validate-usage-rights (ur (string-ascii 200)))
  (if (> (len ur) u0)
      (ok true)
      ERR-INVALID-USAGE-RIGHTS)
)

(define-private (validate-expiration (exp uint))
  (if (> exp block-height)
      (ok true)
      ERR-INVALID-EXPIRATION)
)

(define-private (validate-status (s bool))
  (ok true)
)

(define-private (validate-version (v uint))
  (if (> v u0)
      (ok true)
      ERR-INVALID-VERSION)
)

(define-private (validate-metadata (m (string-ascii 500)))
  (ok true)
)

(define-private (validate-access-level (al uint))
  (if (and (>= al u0) (<= al u5))
      (ok true)
      ERR-INVALID-ACCESS-LEVEL)
)

(define-public (set-authority-contract (contract-principal principal))
  (begin
    (asserts! (is-none (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set authority-contract (some contract-principal))
    (ok true))
)

(define-public (set-max-tk (new-max uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set max-tk new-max)
    (ok true))
)

(define-public (set-registration-fee (new-fee uint))
  (begin
    (asserts! (is-some (var-get authority-contract)) ERR-AUTHORITY-NOT-VERIFIED)
    (var-set registration-fee new-fee)
    (ok true))
)

(define-public (register-tk
  (tk-hash (buff 32))
  (title (string-ascii 100))
  (description (string-ascii 500))
  (community principal)
  (knowledge-type (string-ascii 50))
  (origin (string-ascii 100))
  (royalty-rate uint)
  (license-terms (string-ascii 1000))
  (geolocation { lat: int, lon: int })
  (boundaries { min-lat: int, max-lat: int, min-lon: int, max-lon: int })
  (category (string-ascii 50))
  (usage-rights (string-ascii 200))
  (expiration uint)
  (status bool)
  (version uint)
  (metadata (string-ascii 500))
  (access-level uint))
  (let (
        (next-id (var-get next-tk-id))
        (current-max (var-get max-tk))
        (authority-check (ok true)) ;; mock for now, assume separate contract
      )
    (asserts! (< next-id current-max) ERR-MAX-TK-EXCEEDED)

    (try! (validate-hash tk-hash))
    (try! (validate-title title))
    (try! (validate-description description))
    (try! (validate-knowledge-type knowledge-type))
    (try! (validate-origin origin))
    (try! (validate-royalty-rate royalty-rate))
    (try! (validate-license-terms license-terms))
    (try! (validate-geolocation geolocation))
    (try! (validate-boundaries boundaries))
    (try! (validate-category category))
    (try! (validate-usage-rights usage-rights))
    (try! (validate-expiration expiration))
    (try! (validate-status status))
    (try! (validate-version version))
    (try! (validate-metadata metadata))
    (try! (validate-access-level access-level))
    (try! (validate-community community))

    (asserts! (is-ok authority-check) ERR-NOT-AUTHORIZED)

    (asserts! (is-none (map-get? tk-by-hash tk-hash)) ERR-TK-ALREADY-EXISTS)

    (map-set traditional-knowledge next-id
      {
        hash: tk-hash,
        title: title,
        description: description,
        community: community,
        knowledge-type: knowledge-type,
        origin: origin,
        royalty-rate: royalty-rate,
        license-terms: license-terms,
        geolocation: geolocation,
        boundaries: boundaries,
        timestamp: block-height,
        creator: tx-sender,
        category: category,
        usage-rights: usage-rights,
        expiration: expiration,
        status: status,
        version: version,
        metadata: metadata,
        access-level: access-level
      })

    (map-set tk-by-hash tk-hash next-id)

    (var-set next-tk-id (+ next-id u1))
    (print { event: "tk-registered", id: next-id })
    (ok next-id))
)

(define-public (update-tk
  (tk-id uint)
  (update-hash (buff 32))
  (update-title (string-ascii 100))
  (update-description (string-ascii 500))
  (update-version uint))
  (let (
        (tk (map-get? traditional-knowledge tk-id))
        (authority-check (ok true))
      )
    (match tk
      r
        (begin
          (asserts! (is-eq (get creator r) tx-sender) ERR-NOT-AUTHORIZED)
          (try! (validate-hash update-hash))
          (try! (validate-title update-title))
          (try! (validate-description update-description))
          (try! (validate-version update-version))
          (asserts! (is-ok authority-check) ERR-NOT-AUTHORIZED)

          (let ((existing (map-get? tk-by-hash update-hash)))
            (asserts!
              (or (is-none existing)
                  (is-eq (default-to uffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff existing) tk-id))
              ERR-TK-ALREADY-EXISTS))

          (let ((old-hash (get hash r)))
            (map-delete tk-by-hash old-hash)
            (map-set tk-by-hash update-hash tk-id))

          (map-set traditional-knowledge tk-id
            (merge r
              {
                hash: update-hash,
                title: update-title,
                description: update-description,
                timestamp: block-height,
                version: update-version
              }))

          (map-set tk-updates tk-id
            {
              update-hash: update-hash,
              update-title: update-title,
              update-description: update-description,
              update-timestamp: block-height,
              updater: tx-sender,
              update-version: update-version
            })

          (print { event: "tk-updated", id: tk-id })
          (ok true))
      ERR-TK-NOT-FOUND))
)

(define-public (get-tk-count)
  (ok (var-get next-tk-id))
)

(define-public (check-tk-existence (hash (buff 32)))
  (ok (is-tk-registered hash))
)